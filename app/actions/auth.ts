"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  authenticate,
  changePassword,
  createPasswordResetToken,
  createSession,
  destroySession,
  registerUser,
  requireUser,
  resetPasswordWithToken,
} from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/mail"
import { AppError, fail, type ActionResult } from "@/lib/errors"
import { loginSchema, registerSchema } from "@/lib/validation"
import { LIMITS, clientIpFrom, limit } from "@/lib/rate-limit"

/** Server actions have no Request, so read the forwarded address directly. */
async function ip() {
  return clientIpFrom(await headers())
}

async function gate(key: string, message: (seconds: number) => string) {
  const result = await limit(key, LIMITS.auth.max, LIMITS.auth.windowMs)
  if (!result.ok) throw new AppError("RATE_LIMITED", message(result.retryAfter))
}

/**
 * Two limiters, because they fail in different ways.
 *
 * The address limiter stops one machine hammering many accounts, but an IP is
 * only as trustworthy as the proxy chain it is read from. The account limiter
 * stops many machines hammering ONE account, and its key is the email the
 * caller is trying to sign into — which they cannot rotate without giving up on
 * the account they are attacking.
 *
 * Neither is sufficient alone. Credential stuffing defeats the first; a single
 * host scanning a user list defeats the second.
 */
async function gateAuth(scope: string, account?: string) {
  await gate(
    `${scope}:${await ip()}`,
    (s) => `Too many attempts. Try again in ${s} seconds.`,
  )

  if (account) {
    await gate(
      `${scope}:acct:${account.trim().toLowerCase()}`,
      (s) => `Too many attempts on this account. Try again in ${s} seconds.`,
    )
  }
}

/** The submitted address, for the account-keyed limiter. Never trusted as valid. */
function submittedEmail(formData: FormData): string | undefined {
  const raw = formData.get("email")
  return typeof raw === "string" && raw.length <= 320 ? raw : undefined
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await gateAuth("register", submittedEmail(formData))
    const parsed = registerSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })
    if (!parsed.success) {
      const i = parsed.error.issues[0]
      throw new AppError("VALIDATION", i.message, i.path.join("."))
    }
    const user = await registerUser(parsed.data.email, parsed.data.password)
    await createSession(user.id)
  } catch (e) {
    return fail(e)
  }
  redirect("/onboarding")
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let destination = "/dashboard"
  try {
    await gateAuth("login", submittedEmail(formData))
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })
    if (!parsed.success) {
      const i = parsed.error.issues[0]
      throw new AppError("VALIDATION", i.message, i.path.join("."))
    }
    const user = await authenticate(parsed.data.email, parsed.data.password)
    await createSession(user.id)
    destination = user.role === "ADMIN" ? "/admin" : "/dashboard"
  } catch (e) {
    return fail(e)
  }
  redirect(destination)
}

export async function logoutAction() {
  await destroySession()
  redirect("/")
}

// =========================== password reset ===========================

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("That doesn't look like an email address."),
})

const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Those two passwords don't match.",
    path: ["confirm"],
  })

/**
 * Always reports success, whether or not the address has an account — the form
 * must not become a way to find out who is registered.
 *
 * No mailer is wired yet, so in development the link comes back in the result
 * and the page shows it. In production that branch does nothing and the link
 * goes out by email instead.
 */
export async function requestPasswordResetAction(
  _prev: ActionResult<{ devLink?: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ devLink?: string }>> {
  try {
    await gateAuth("reset-request", submittedEmail(formData))

    const parsed = emailSchema.safeParse({ email: formData.get("email") })
    if (!parsed.success) {
      throw new AppError("VALIDATION", parsed.error.issues[0].message, "email")
    }

    const token = await createPasswordResetToken(parsed.data.email)

    // Showing the link on screen is a development convenience, and it must be
    // opted into explicitly — not inferred from NODE_ENV, which is
    // "production" for any built server including a staging one. Anyone who
    // leaves this on in a real deployment hands out password resets.
    const showLink = process.env.AUTH_DEV_SHOW_RESET_LINK === "true"

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const resetLink = `${base}/reset-password/${token}`

    if (token) {
      // A mailer failure must never change what this form says. If it did, the
      // difference between "sent" and "something went wrong" would tell an
      // attacker which addresses have accounts — the exact leak the uniform
      // response above exists to prevent.
      try {
        await sendPasswordResetEmail(parsed.data.email, resetLink)
      } catch (mailError) {
        console.error("Password reset email failed to send", mailError)
      }
    }

    if (token && showLink) {
      return { ok: true, data: { devLink: resetLink } }
    }

    return { ok: true, data: {} }
  } catch (e) {
    return fail(e)
  }
}

export async function resetPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await gateAuth("reset")

    const parsed = resetSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    })
    if (!parsed.success) {
      const i = parsed.error.issues[0]
      throw new AppError("VALIDATION", i.message, i.path.join("."))
    }

    const userId = await resetPasswordWithToken(parsed.data.token, parsed.data.password)
    // Every old session was destroyed; start a fresh one for this browser.
    await createSession(userId)
  } catch (e) {
    return fail(e)
  }
  redirect("/dashboard")
}

export async function changePasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const current = String(formData.get("current") ?? "")
    const next = String(formData.get("password") ?? "")
    const confirm = String(formData.get("confirm") ?? "")

    if (next.length < 8) throw new AppError("VALIDATION", "Use at least 8 characters.", "password")
    if (next !== confirm) {
      throw new AppError("VALIDATION", "Those two passwords don't match.", "confirm")
    }

    await changePassword(user.id, current, next)
    await createSession(user.id)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
