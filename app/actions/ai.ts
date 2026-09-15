"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppError, fail, type ActionResult } from "@/lib/errors"
import { runTask, type AIResult, type AITask } from "@/lib/ai"
import { recomputeCompleteness } from "@/lib/completeness/recompute"
import { LIMITS, limit } from "@/lib/rate-limit"

export async function generate(
  task: AITask,
  userText?: string,
): Promise<ActionResult<AIResult>> {
  try {
    const user = await requireUser()

    // The monthly quota caps spend over a month; this caps a runaway loop in a
    // minute. LIMITS.ai existed for this and was never applied.
    const gate = await limit(`ai:${user.id}`, LIMITS.ai.max, LIMITS.ai.windowMs)
    if (!gate.ok) {
      throw new AppError(
        "RATE_LIMITED",
        `That's a lot of requests at once. Try again in ${gate.retryAfter} seconds.`,
      )
    }

    const result = await runTask(user.id, task, userText)
    return { ok: true, data: result }
  } catch (e) {
    return fail(e)
  }
}

/** Suggestions are never saved until the user accepts one. */
export async function acceptAbout(text: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    await db.profile.update({ where: { userId: user.id }, data: { about: text.slice(0, 2000) } })
    await db.aIRequest.updateMany({
      where: { userId: user.id, task: "about_me", accepted: null },
      data: { accepted: true },
    })
    await recomputeCompleteness(user.id)
    revalidatePath("/dashboard", "layout")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function discardSuggestion(task: AITask): Promise<ActionResult> {
  try {
    const user = await requireUser()
    await db.aIRequest.updateMany({
      where: { userId: user.id, task, accepted: null },
      data: { accepted: false },
    })
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
