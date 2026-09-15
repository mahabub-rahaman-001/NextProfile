"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { ApplicationStatus } from "@prisma/client"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"
import { loadFullProfile } from "@/lib/profile/load"
import { matchProfileToJob, type MatchResult } from "@/lib/matching"
import { docConfigSchema } from "@/lib/validation"
import { LIMITS, limit } from "@/lib/rate-limit"
import { saveVersion } from "./versions"

const applicationSchema = z.object({
  company: z.string().trim().min(1, "Which company?").max(160),
  role: z.string().trim().min(1, "Which role?").max(160),
  location: z.string().trim().max(120).optional(),
  jobUrl: z.string().trim().max(500).optional(),
  jobDescription: z.string().max(20_000).optional(),
  documentId: z.string().optional().nullable(),
  status: z
    .enum(["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"])
    .default("SAVED"),
  appliedAt: z.string().optional().nullable(),
  nextStep: z.string().trim().max(200).optional(),
  nextStepAt: z.string().optional().nullable(),
  notes: z.string().max(4000).optional(),
})

const toDate = (s?: string | null) => (s ? new Date(s) : null)

/** Analyse a pasted job ad. No model call — see lib/matching. */
export async function analyseJob(jobDescription: string): Promise<ActionResult<MatchResult>> {
  try {
    const user = await requireUser()

    const gate = await limit(`analyse:${user.id}`, LIMITS.analyse.max, LIMITS.analyse.windowMs)
    if (!gate.ok) {
      throw new AppError(
        "RATE_LIMITED",
        `That's a lot of job ads at once. Try again in ${gate.retryAfter} seconds.`,
      )
    }

    const data = await loadFullProfile(user.id)
    if (!data) throw new AppError("NOT_FOUND", "Profile not found.")
    return { ok: true, data: matchProfileToJob(data, jobDescription.slice(0, 20_000)) }
  } catch (e) {
    return fail(e)
  }
}

export async function createApplication(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const parsed = applicationSchema.safeParse(input)
    if (!parsed.success) {
      const i = parsed.error.issues[0]
      throw new AppError("VALIDATION", i.message, i.path.join("."))
    }

    const { jobDescription, appliedAt, nextStepAt, documentId, ...rest } = parsed.data

    // saveVersion below checks ownership, but the id is also written to the row
    // on its own — so without this an application can point at someone else's
    // document.
    if (documentId) {
      const owned = await db.document.findFirst({
        where: { id: documentId, userId: user.id },
        select: { id: true },
      })
      if (!owned) throw new AppError("NOT_FOUND", "That document no longer exists.")
    }

    let matchScore: number | null = null
    if (jobDescription?.trim()) {
      const data = await loadFullProfile(user.id)
      if (data) matchScore = matchProfileToJob(data, jobDescription).score
    }

    // Freeze what was sent, if a document was attached.
    let versionId: string | null = null
    if (documentId) {
      const v = await saveVersion(documentId, `${rest.company} — ${rest.role}`)
      if (v.ok && v.data) versionId = v.data.id
    }

    const last = await db.application.findFirst({
      where: { userId: user.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })

    const app = await db.application.create({
      data: {
        ...rest,
        userId: user.id,
        documentId: documentId || null,
        versionId,
        jobDescription: jobDescription || null,
        matchScore,
        appliedAt: toDate(appliedAt),
        nextStepAt: toDate(nextStepAt),
        sortOrder: (last?.sortOrder ?? 0) + 1000,
      },
    })

    revalidatePath("/dashboard/applications")
    return { ok: true, data: { id: app.id } }
  } catch (e) {
    return fail(e)
  }
}

export async function updateApplication(id: string, input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const parsed = applicationSchema.partial().safeParse(input)
    if (!parsed.success) {
      const i = parsed.error.issues[0]
      throw new AppError("VALIDATION", i.message, i.path.join("."))
    }

    const { appliedAt, nextStepAt, ...rest } = parsed.data

    // Same ownership check as on create — this field is a foreign key the
    // caller supplies.
    if (rest.documentId) {
      const owned = await db.document.findFirst({
        where: { id: rest.documentId, userId: user.id },
        select: { id: true },
      })
      if (!owned) throw new AppError("NOT_FOUND", "That document no longer exists.")
    }

    const res = await db.application.updateMany({
      where: { id, userId: user.id, deletedAt: null },
      data: {
        ...rest,
        ...(appliedAt !== undefined ? { appliedAt: toDate(appliedAt) } : {}),
        ...(nextStepAt !== undefined ? { nextStepAt: toDate(nextStepAt) } : {}),
      },
    })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That application no longer exists.")

    revalidatePath("/dashboard/applications")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const res = await db.application.updateMany({
      where: { id, userId: user.id, deletedAt: null },
      data: {
        status,
        ...(status === "APPLIED" ? { appliedAt: new Date() } : {}),
      },
    })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That application no longer exists.")
    revalidatePath("/dashboard/applications")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const res = await db.application.updateMany({
      where: { id, userId: user.id, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    if (res.count === 0) throw new AppError("NOT_FOUND", "That application no longer exists.")
    revalidatePath("/dashboard/applications")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

/**
 * A tailored copy: same profile data, its own section order and name. The
 * original is untouched, which is the whole point — one profile, many framings.
 */
export async function createTailoredResume(
  sourceDocumentId: string,
  company: string,
  role: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const source = await db.document.findFirst({
      where: { id: sourceDocumentId, userId: user.id },
    })
    if (!source) throw new AppError("NOT_FOUND", "That document no longer exists.")

    const config = docConfigSchema.parse(source.config ?? {})

    const copy = await db.document.create({
      data: {
        userId: user.id,
        kind: source.kind,
        name: `${role} — ${company}`.slice(0, 80),
        templateId: source.templateId,
        config,
      },
    })

    revalidatePath("/dashboard/resume")
    return { ok: true, data: { id: copy.id } }
  } catch (e) {
    return fail(e)
  }
}
