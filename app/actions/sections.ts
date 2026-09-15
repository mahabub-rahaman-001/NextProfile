"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"
import { delegate, isSectionSlug, SECTIONS, type SectionSlug } from "@/lib/sections/registry"
import { midpoint, needsRenormalise, renormalise, SORT_GAP } from "@/lib/sort-order"
import { recomputeCompleteness } from "@/lib/completeness/recompute"

function section(slug: string): SectionSlug {
  if (!isSectionSlug(slug)) throw new AppError("NOT_FOUND", "Unknown section.")
  return slug
}

async function afterWrite(userId: string) {
  await recomputeCompleteness(userId)
  revalidatePath("/dashboard", "layout")
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } })
  if (user?.username) revalidatePath(`/view/${user.username}`)
}

export async function createItem(
  slug: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const s = section(slug)
    const parsed = SECTIONS[s].schema.safeParse(input)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw new AppError("VALIDATION", issue.message, issue.path.join("."))
    }

    const last = await delegate(s).findFirst({
      where: { userId: user.id, deletedAt: null },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })

    const row = await delegate(s).create({
      data: {
        ...(parsed.data as object),
        userId: user.id,
        sortOrder: (last?.sortOrder ?? 0) + SORT_GAP,
      },
    })

    await afterWrite(user.id)
    return { ok: true, data: { id: row.id } }
  } catch (e) {
    return fail(e)
  }
}

export async function updateItem(
  slug: string,
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const s = section(slug)
    const parsed = SECTIONS[s].schema.safeParse(input)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw new AppError("VALIDATION", issue.message, issue.path.join("."))
    }

    // Compound where — the update fails if the row is not this user's.
    const count = await delegate(s).updateMany({
      where: { id, userId: user.id, deletedAt: null },
      data: parsed.data as object,
    })
    if (count.count === 0) throw new AppError("NOT_FOUND", "That item no longer exists.")

    await afterWrite(user.id)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteItem(slug: string, id: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const s = section(slug)
    // Soft delete — people delete a job and want it back.
    const res = await delegate(s).updateMany({
      where: { id, userId: user.id, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That item no longer exists.")
    await afterWrite(user.id)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function restoreItem(slug: string, id: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const s = section(slug)
    const res = await delegate(s).updateMany({
      where: { id, userId: user.id },
      data: { deletedAt: null },
    })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That item no longer exists.")
    await afterWrite(user.id)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

/** Moves one row by writing one value: the midpoint between its new neighbours. */
export async function moveItem(
  slug: string,
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const s = section(slug)

    const rows = await delegate(s).findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, sortOrder: true },
    })
    const index = rows.findIndex((r: { id: string }) => r.id === id)
    if (index < 0) throw new AppError("NOT_FOUND", "That item no longer exists.")

    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= rows.length) return { ok: true } // already at the end

    const before = direction === "up" ? rows[target - 1]?.sortOrder : rows[target]?.sortOrder
    const after = direction === "up" ? rows[target]?.sortOrder : rows[target + 1]?.sortOrder

    await delegate(s).updateMany({
      where: { id, userId: user.id },
      data: { sortOrder: midpoint(before ?? null, after ?? null) },
    })

    // Each drop into the same slot halves the gap to its neighbour. Left alone
    // that reaches the limits of float precision and two rows end up with the
    // same sortOrder, at which point the list order becomes arbitrary.
    // needsRenormalise/renormalise existed and were unit-tested but were never
    // called; this is the one place that can notice.
    const afterMove = await delegate(s).findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, sortOrder: true },
    })
    if (needsRenormalise(afterMove.map((r: { sortOrder: number }) => r.sortOrder))) {
      const spaced = renormalise(afterMove.length)
      await db.$transaction(
        afterMove.map((row: { id: string }, i: number) =>
          delegate(s).update({ where: { id: row.id }, data: { sortOrder: spaced[i] } }),
        ),
      )
    }

    revalidatePath("/dashboard", "layout")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
