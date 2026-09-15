import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { AppError } from "@/lib/errors"

/**
 * Auth lives behind this module. No feature file imports a vendor SDK, so
 * swapping to Clerk or Auth.js later is a change here and nowhere else.
 * (See the auth decision in docs/09-RISKS-DECISIONS.md.)
 */

const COOKIE = "np_session"
const MAX_AGE_DAYS = 30

function secret() {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 16) throw new Error("AUTH_SECRET is missing or too short")
  return s
}

function sign(sessionId: string) {
  const sig = createHmac("sha256", secret()).update(sessionId).digest("hex")
  return `${sessionId}.${sig}`
}

function unsign(value: string): string | null {
  const idx = value.lastIndexOf(".")
  if (idx < 1) return null
  const id = value.slice(0, idx)
  const sig = value.slice(idx + 1)
  const expected = createHmac("sha256", secret()).update(id).digest("hex")
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null
  } catch {
    return null
  }
  return id
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string | null) {
  if (!hash) return false
  return bcrypt.compare(plain, hash)
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + MAX_AGE_DAYS * 86_400_000)
  const session = await db.session.create({ data: { userId, expiresAt } })
  const jar = await cookies()
  jar.set(COOKIE, sign(session.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function destroySession() {
  const jar = await cookies()
  const raw = jar.get(COOKIE)?.value
  if (raw) {
    const id = unsign(raw)
    if (id) await db.session.deleteMany({ where: { id } })
  }
  jar.delete(COOKIE)
}

export type SessionUser = {
  id: string
  email: string
  username: string | null
  emailVerified: Date | null
  onboarded: boolean
  role: "USER" | "ADMIN"
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies()
  const raw = jar.get(COOKIE)?.value
  if (!raw) return null
  const id = unsign(raw)
  if (!id) return null

  const session = await db.session.findUnique({
    where: { id },
    include: { user: { include: { profile: { select: { onboardedAt: true } } } } },
  })
  if (!session) return null

  if (session.expiresAt < new Date()) {
    // Sweep it as we pass. Without this, expired rows accumulate forever.
    await db.session.deleteMany({ where: { id } }).catch(() => {})
    return null
  }

  // A suspended account keeps its data but cannot act.
  if (session.user.suspendedAt) return null

  return {
    id: session.user.id,
    email: session.user.email,
    username: session.user.username,
    emailVerified: session.user.emailVerified,
    onboarded: Boolean(session.user.profile?.onboardedAt),
    role: session.user.role,
  }
}

/** Use in every server action and route handler that touches user data. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) throw new AppError("UNAUTHENTICATED", "Please sign in again.")
  return user
}

/** Use in pages — redirects rather than throwing. */
export async function requirePage(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) redirect("/login")
  return user
}

/** Creates the User and its empty Profile together — half the app can then assume both exist. */
export async function registerUser(email: string, password: string) {
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) throw new AppError("CONFLICT", "An account with that email already exists.", "email")

  const user = await db.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      // Dev: auto-verify. In production this is set by the emailed token.
      emailVerified: process.env.NODE_ENV === "production" ? null : new Date(),
      profile: { create: { fullName: "" } },
      portfolio: { create: {} },
    },
  })

  await db.verificationToken.create({
    data: {
      userId: user.id,
      token: randomBytes(24).toString("hex"),
      kind: "verify_email",
      expiresAt: new Date(Date.now() + 86_400_000),
    },
  })

  return user
}

export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } })
  // Same message either way — never reveal whether an email is registered.
  const bad = new AppError("VALIDATION", "That email and password don't match.", "password")
  if (!user) throw bad
  if (!(await verifyPassword(password, user.passwordHash))) throw bad

  if (user.suspendedAt) {
    throw new AppError(
      "FORBIDDEN",
      user.suspendedReason
        ? `This account is suspended: ${user.suspendedReason}`
        : "This account is suspended. Contact support if you think that is a mistake.",
    )
  }

  return user
}

// ============================== admin ==============================

/** Use in admin server actions and route handlers. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  // NOT_FOUND, not FORBIDDEN: a non-admin should not learn the area exists.
  if (user.role !== "ADMIN") throw new AppError("NOT_FOUND", "Not found.")
  return user
}

/** Use in admin pages — 404s rather than redirecting, for the same reason. */
export async function requireAdminPage(): Promise<SessionUser> {
  const user = await getSession()
  if (!user || user.role !== "ADMIN") notFound()
  return user
}

// =========================== password reset ===========================

const RESET_TTL_MS = 60 * 60 * 1000 // one hour

/**
 * Creates a single-use reset token. Returns it so the caller can mail it — or,
 * in development where no mailer is wired, show it on screen.
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email } })
  // Caller must behave identically when this returns null, or the form becomes
  // a way to discover which emails have accounts.
  if (!user || user.suspendedAt) return null

  // One live token at a time.
  await db.verificationToken.updateMany({
    where: { userId: user.id, kind: "reset_password", usedAt: null },
    data: { usedAt: new Date() },
  })

  const token = randomBytes(32).toString("base64url")
  await db.verificationToken.create({
    data: {
      userId: user.id,
      token,
      kind: "reset_password",
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  })

  return token
}

export async function findValidResetToken(token: string) {
  const row = await db.verificationToken.findUnique({ where: { token } })
  if (!row) return null
  if (row.kind !== "reset_password") return null
  if (row.usedAt) return null
  if (row.expiresAt < new Date()) return null
  return row
}

/**
 * Consumes the token, sets the new password, and destroys every other session
 * for that account — if the reset was triggered because someone else had
 * access, leaving their session alive would defeat the point.
 */
export async function resetPasswordWithToken(token: string, password: string) {
  const row = await findValidResetToken(token)
  if (!row) {
    throw new AppError(
      "VALIDATION",
      "That reset link is no longer valid. Request a new one.",
      "token",
    )
  }

  await db.$transaction([
    db.verificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    db.user.update({
      where: { id: row.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    db.session.deleteMany({ where: { userId: row.userId } }),
  ])

  return row.userId
}

/** Signed-in password change. Also clears other sessions. */
export async function changePassword(userId: string, current: string, next: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError("NOT_FOUND", "Account not found.")
  if (!(await verifyPassword(current, user.passwordHash))) {
    throw new AppError("VALIDATION", "That is not your current password.", "current")
  }

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(next) },
  })
  await db.session.deleteMany({ where: { userId } })
}
