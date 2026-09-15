"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"
import { loadFullProfile } from "@/lib/profile/load"

/**
 * A version freezes BOTH the presentation config and a copy of the profile
 * data behind it.
 *
 * That looks like a violation of "separate data from presentation", and it is
 * a deliberate exception: the point of a version is to answer "what exactly did
 * I send to that employer in March?". If it rendered from live data, the answer
 * would change every time the user edited their profile. Everywhere else, data
 * stays separate; here it is frozen on purpose.
 */
export async function saveVersion(
  documentId: string,
  label?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const doc = await db.document.findFirst({ where: { id: documentId, userId: user.id } })
    if (!doc) throw new AppError("NOT_FOUND", "That document no longer exists.")

    const data = await loadFullProfile(user.id)
    if (!data) throw new AppError("NOT_FOUND", "Profile not found.")

    const version = await db.documentVersion.create({
      data: {
        documentId: doc.id,
        userId: user.id,
        label: label?.slice(0, 80) || null,
        templateId: doc.templateId,
        kind: doc.kind,
        config: doc.config ?? {},
        snapshot: JSON.parse(JSON.stringify(data)),
      },
    })

    revalidatePath(`/dashboard/resume/${documentId}`)
    return { ok: true, data: { id: version.id } }
  } catch (e) {
    return fail(e)
  }
}

/**
 * Restores the LOOK of a version — template and section config — not the
 * content. Restoring old content would silently undo real profile edits, which
 * is never what someone wants. The frozen copy stays viewable and downloadable.
 */
export async function restoreVersion(versionId: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const version = await db.documentVersion.findFirst({
      where: { id: versionId, userId: user.id },
    })
    if (!version) throw new AppError("NOT_FOUND", "That version no longer exists.")

    // Snapshot the current state first, so a restore is itself undoable.
    await saveVersion(version.documentId, "Before restore")

    await db.document.updateMany({
      where: { id: version.documentId, userId: user.id },
      data: { templateId: version.templateId, config: version.config ?? {} },
    })

    revalidatePath(`/dashboard/resume/${version.documentId}`)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteVersion(versionId: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const res = await db.documentVersion.deleteMany({ where: { id: versionId, userId: user.id } })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That version no longer exists.")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
