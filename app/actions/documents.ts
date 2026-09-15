"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"
import { docConfigSchema, portfolioConfigSchema } from "@/lib/validation"
import { getRecommendations } from "@/lib/modules"

export async function createDocument(kind: "RESUME" | "CV"): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const profile = await db.profile.findUnique({ where: { userId: user.id } })
    const rec = getRecommendations(profile?.profileType ?? "STUDENT")

    const doc = await db.document.create({
      data: {
        userId: user.id,
        kind,
        name: kind === "CV" ? "Academic CV" : "My Resume",
        templateId: rec.templateId,
        config: docConfigSchema.parse({}),
      },
    })
    revalidatePath("/dashboard/resume")
    return { ok: true, data: { id: doc.id } }
  } catch (e) {
    return fail(e)
  }
}

export async function updateDocument(
  id: string,
  input: { name?: string; templateId?: string; config?: unknown },
): Promise<ActionResult> {
  try {
    const user = await requireUser()

    const data: Record<string, unknown> = {}
    if (input.name !== undefined) data.name = input.name.slice(0, 80)
    if (input.templateId !== undefined) data.templateId = input.templateId
    if (input.config !== undefined) {
      const parsed = docConfigSchema.safeParse(input.config)
      if (!parsed.success) throw new AppError("VALIDATION", parsed.error.issues[0].message)
      data.config = parsed.data
    }

    const res = await db.document.updateMany({ where: { id, userId: user.id }, data })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That document no longer exists.")

    revalidatePath(`/dashboard/resume/${id}`)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const res = await db.document.deleteMany({ where: { id, userId: user.id } })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That document no longer exists.")
    revalidatePath("/dashboard/resume")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function duplicateDocument(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const source = await db.document.findFirst({ where: { id, userId: user.id } })
    if (!source) throw new AppError("NOT_FOUND", "That document no longer exists.")

    const copy = await db.document.create({
      data: {
        userId: user.id,
        kind: source.kind,
        name: `${source.name} (copy)`,
        templateId: source.templateId,
        config: source.config ?? {},
      },
    })
    revalidatePath("/dashboard/resume")
    return { ok: true, data: { id: copy.id } }
  } catch (e) {
    return fail(e)
  }
}

// ----------------------------------------------------------------- portfolio

export async function updatePortfolio(input: {
  themeId?: string
  config?: unknown
}): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const data: Record<string, unknown> = {}
    if (input.themeId !== undefined) data.themeId = input.themeId
    if (input.config !== undefined) {
      const parsed = portfolioConfigSchema.safeParse(input.config)
      if (!parsed.success) throw new AppError("VALIDATION", parsed.error.issues[0].message)
      data.config = parsed.data
    }

    await db.portfolio.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...(data as { themeId?: string }) },
      update: data,
    })

    revalidatePath("/dashboard/portfolio")
    const u = await db.user.findUnique({ where: { id: user.id }, select: { username: true } })
    if (u?.username) revalidatePath(`/view/${u.username}`)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function publishPortfolio(publish: boolean): Promise<ActionResult> {
  try {
    const user = await requireUser()
    if (publish && !user.username) {
      throw new AppError("VALIDATION", "Choose your profile address first.", "username")
    }
    if (publish && !user.emailVerified && process.env.NODE_ENV === "production") {
      throw new AppError("FORBIDDEN", "Verify your email address before publishing.")
    }

    await db.portfolio.update({
      where: { userId: user.id },
      data: { published: publish, publishedAt: publish ? new Date() : null },
    })
    await db.profile.update({
      where: { userId: user.id },
      data: {
        visibility: publish ? "PUBLIC" : "PRIVATE",
        publishedAt: publish ? new Date() : null,
      },
    })

    revalidatePath("/dashboard", "layout")
    if (user.username) revalidatePath(`/view/${user.username}`)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
