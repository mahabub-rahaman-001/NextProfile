import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { LIMITS, clientIp, limit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const REASONS = new Set([
  "impersonation",
  "fake_credentials",
  "offensive",
  "spam",
  "not_a_real_person",
  "other",
])

/** Public: anyone viewing a profile can report it. Reviewed by a human, not automated. */
export async function POST(req: Request) {
  // Reports go to a human queue, so a flood is expensive in attention.
  const gate = await limit(`report:${clientIp(req)}`, LIMITS.report.max, LIMITS.report.windowMs)
  if (!gate.ok) return tooMany(gate)

  try {
    const { username, reason, detail } = await req.json()
    if (!username || !REASONS.has(reason)) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "Choose a reason." } },
        { status: 400 },
      )
    }

    const exists = await db.user.findUnique({
      where: { username: String(username) },
      select: { id: true },
    })
    if (!exists) return NextResponse.json({ ok: true }) // don't confirm who exists

    await db.abuseReport.create({
      data: {
        username: String(username).slice(0, 40),
        reason,
        detail: detail ? String(detail).slice(0, 2000) : null,
        reporterIp:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 45) ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message: "Couldn't send that report." } },
      { status: 500 },
    )
  }
}
