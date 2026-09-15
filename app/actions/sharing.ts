"use server"

import { randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"

/**
 * A private link: unlisted, expiring, revocable. For sending your profile to
 * one recruiter without publishing it to the world — the "I don't want my
 * current employer to see this" case.
 */
export async function createShareLink(input: {
  label?: string
  documentId?: string | null
  days?: number
}): Promise<ActionResult<{ token: string }>> {
  try {
    const user = await requireUser()

    if (input.documentId) {
      const doc = await db.document.findFirst({
        where: { id: input.documentId, userId: user.id },
        select: { id: true },
      })
      if (!doc) throw new AppError("NOT_FOUND", "That document no longer exists.")
    }

    const days = Math.min(Math.max(input.days ?? 30, 1), 365)

    const link = await db.shareLink.create({
      data: {
        userId: user.id,
        token: randomBytes(16).toString("base64url"),
        label: input.label?.slice(0, 80) || null,
        documentId: input.documentId || null,
        expiresAt: new Date(Date.now() + days * 86_400_000),
      },
    })

    revalidatePath("/dashboard/share")
    return { ok: true, data: { token: link.token } }
  } catch (e) {
    return fail(e)
  }
}

export async function revokeShareLink(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const res = await db.shareLink.updateMany({
      where: { id, userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That link no longer exists.")
    revalidatePath("/dashboard/share")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteShareLink(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    await db.shareLink.deleteMany({ where: { id, userId: user.id } })
    revalidatePath("/dashboard/share")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
