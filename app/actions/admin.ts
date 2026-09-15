"use server"

import { revalidatePath } from "next/cache"
import type { ReportStatus } from "@prisma/client"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"

/**
 * Admin actions. Every one of these is a power over someone else's account, so
 * each is deliberately narrow, reversible, and leaves the user's data intact.
 * Nothing here deletes anything.
 */

export async function suspendUser(userId: string, reason: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    if (userId === admin.id) {
      throw new AppError("VALIDATION", "You cannot suspend your own account.")
    }

    const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (!target) throw new AppError("NOT_FOUND", "No such account.")
    if (target.role === "ADMIN") {
      throw new AppError("VALIDATION", "Demote this admin before suspending them.")
    }

    await db.user.update({
      where: { id: userId },
      data: { suspendedAt: new Date(), suspendedReason: reason.slice(0, 200) || null },
    })
    // Kick them out of any browser they are already signed in on.
    await db.session.deleteMany({ where: { userId } })

    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    await db.user.update({
      where: { id: userId },
      data: { suspendedAt: null, suspendedReason: null },
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setRole(userId: string, role: "USER" | "ADMIN"): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()

    if (role === "USER") {
      if (userId === admin.id) {
        throw new AppError("VALIDATION", "You cannot remove your own admin access.")
      }
      const admins = await db.user.count({ where: { role: "ADMIN" } })
      if (admins <= 1) {
        throw new AppError("VALIDATION", "There has to be at least one admin.")
      }
    }

    await db.user.update({ where: { id: userId }, data: { role } })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function resolveReport(
  reportId: string,
  status: ReportStatus,
  note?: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    await db.abuseReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: admin.email,
        adminNote: note?.slice(0, 500) || null,
      },
    })
    revalidatePath("/admin/reports")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

/** Unpublish a profile without suspending the person behind it. */
export async function unpublishProfile(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    await db.portfolio.updateMany({ where: { userId }, data: { published: false } })
    await db.profile.updateMany({ where: { userId }, data: { visibility: "PRIVATE" } })

    const u = await db.user.findUnique({ where: { id: userId }, select: { username: true } })
    if (u?.username) revalidatePath(`/view/${u.username}`)
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
