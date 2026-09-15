"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"
import { onboardingSchema, profileSchema, usernameSchema } from "@/lib/validation"
import { getRecommendations } from "@/lib/modules"
import { recomputeCompleteness } from "@/lib/completeness/recompute"

const RESERVED = new Set([
  "admin", "api", "u", "login", "register", "logout", "verify", "forgot-password",
  "dashboard", "onboarding", "settings", "pricing", "about", "help", "support",
  "blog", "terms", "privacy", "print", "static", "assets", "www", "app", "sitemap.xml",
  "robots.txt", "favicon.ico", "nextprofile",
])

export async function saveOnboarding(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const parsed = onboardingSchema.safeParse(input)
    if (!parsed.success) {
      const i = parsed.error.issues[0]
      throw new AppError("VALIDATION", i.message, i.path.join("."))
    }

    const rec = getRecommendations(parsed.data.profileType)

    await db.profile.update({
      where: { userId: user.id },
      data: { ...parsed.data, onboardedAt: new Date() },
    })

    // Pre-create the document they asked for, using the recommended template.
    const wantsCv = parsed.data.wants.includes("cv")
    const wantsResume = parsed.data.wants.includes("resume") || parsed.data.wants.length === 0
    const existing = await db.document.count({ where: { userId: user.id } })

    if (existing === 0 && (wantsResume || wantsCv)) {
      await db.document.create({
        data: {
          userId: user.id,
          kind: wantsCv && !wantsResume ? "CV" : "RESUME",
          name: wantsCv && !wantsResume ? "Academic CV" : "My Resume",
          templateId: rec.templateId,
          config: { density: "regular", accent: "#0E5C4A", paper: "A4", hidden: [], onePage: false },
        },
      })
    }

    await db.portfolio.upsert({
      where: { userId: user.id },
      create: { userId: user.id, themeId: rec.themeId },
      update: { themeId: rec.themeId },
    })

    revalidatePath("/dashboard", "layout")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function saveBasics(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const parsed = profileSchema.safeParse(input)
    if (!parsed.success) {
      const i = parsed.error.issues[0]
      throw new AppError("VALIDATION", i.message, i.path.join("."))
    }

    const current = await db.profile.findUnique({ where: { userId: user.id } })
    if (!current) throw new AppError("NOT_FOUND", "Profile not found.")

    const { contact, links, seo, ...rest } = parsed.data
    await db.profile.update({
      where: { userId: user.id },
      data: {
        ...rest,
        contact: { ...(current.contact as object), ...(contact ?? {}) },
        links: { ...(current.links as object), ...(links ?? {}) },
        seo: { ...(current.seo as object), ...(seo ?? {}) },
      },
    })

    await recomputeCompleteness(user.id)
    revalidatePath("/dashboard", "layout")
    const u = await db.user.findUnique({ where: { id: user.id }, select: { username: true } })
    if (u?.username) revalidatePath(`/view/${u.username}`)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function changeProfileType(input: unknown): Promise<ActionResult> {
  // Changing type re-runs module selection. It never deletes or alters a row.
  return saveOnboarding(input)
}

export async function checkUsername(
  raw: string,
): Promise<{ available: boolean; reason?: string; value?: string }> {
  const parsed = usernameSchema.safeParse(raw)
  if (!parsed.success) return { available: false, reason: parsed.error.issues[0].message }
  const value = parsed.data
  if (RESERVED.has(value)) return { available: false, reason: "That name is reserved.", value }

  const user = await db.user.findUnique({ where: { username: value }, select: { id: true } })
  const me = await requireUser()
  if (user && user.id !== me.id) return { available: false, reason: "That name is taken.", value }
  return { available: true, value }
}

export async function claimUsername(raw: string): Promise<ActionResult<{ username: string }>> {
  try {
    const user = await requireUser()
    const check = await checkUsername(raw)
    if (!check.available || !check.value) {
      throw new AppError("CONFLICT", check.reason ?? "That name is not available.", "username")
    }

    const existing = await db.user.findUnique({ where: { id: user.id } })
    if (existing?.usernameLockedUntil && existing.usernameLockedUntil > new Date() && existing.username !== check.value) {
      throw new AppError(
        "CONFLICT",
        `You can change your username again after ${existing.usernameLockedUntil.toLocaleDateString()}.`,
        "username",
      )
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        username: check.value,
        usernameLockedUntil: new Date(Date.now() + 30 * 86_400_000),
      },
    })

    revalidatePath("/dashboard", "layout")
    return { ok: true, data: { username: check.value } }
  } catch (e) {
    return fail(e)
  }
}

export async function completeOnboardingAndGo(input: unknown) {
  const result = await saveOnboarding(input)
  if (result.ok) redirect("/dashboard/profile")
  return result
}
