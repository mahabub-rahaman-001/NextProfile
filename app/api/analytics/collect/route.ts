import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hostOf, isBot, visitorHash } from "@/lib/analytics/visitor"
import { LIMITS, clientIp, limit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const ALLOWED = new Set([
  "profile_view",
  "project_view",
  "resume_download",
  "contact_click",
  "link_click",
])

/** Public endpoint — it fires from published profiles. Stores no raw IP. */
export async function POST(req: Request) {
  // Unlimited, this endpoint lets anyone inflate someone's view count or fill
  // the events table. 204 either way — analytics must never break a page.
  const gate = await limit(`analytics:${clientIp(req)}`, LIMITS.analytics.max, LIMITS.analytics.windowMs)
  if (!gate.ok) return new NextResponse(null, { status: 204 })

  try {
    const { username, type, targetId } = await req.json()
    if (!username || !ALLOWED.has(type)) return new NextResponse(null, { status: 204 })

    const ua = req.headers.get("user-agent") ?? ""
    if (isBot(ua)) return new NextResponse(null, { status: 204 })

    const owner = await db.user.findUnique({
      where: { username: String(username) },
      select: { id: true, portfolio: { select: { published: true } } },
    })
    if (!owner?.portfolio?.published) return new NextResponse(null, { status: 204 })

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "0.0.0.0"

    await db.analyticsEvent.create({
      data: {
        userId: owner.id,
        type,
        targetId: targetId ? String(targetId).slice(0, 40) : null,
        visitorHash: visitorHash(ip, ua),
        country: req.headers.get("x-vercel-ip-country"),
        referrerHost: hostOf(req.headers.get("referer")),
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    // Analytics must never break a page.
    return new NextResponse(null, { status: 204 })
  }
}
