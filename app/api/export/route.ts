import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { LIMITS, limit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

/**
 * Download everything we hold about you, in one file, readable without our
 * software. A product built on someone's career record owes them this.
 */
export async function GET() {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 })
  }

  // 21 parallel queries returning the account's entire record. Cheap to ask
  // for, expensive to answer, so it gets the same ceiling as a PDF render.
  const gate = await limit(`export:${user.id}`, LIMITS.pdf.max, LIMITS.pdf.windowMs)
  if (!gate.ok) return tooMany(gate)

  const where = { userId: user.id }

  const [
    account, profile, educations, experiences, skills, projects, certifications, achievements,
    publications, researches, conferences, services, caseStudies, testimonials,
    documents, versions, portfolio, applications, shareLinks, aiRequests, events,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { email: true, username: true, plan: true, createdAt: true, emailVerified: true },
    }),
    db.profile.findUnique({ where }),
    db.education.findMany({ where }),
    db.experience.findMany({ where }),
    db.skill.findMany({ where }),
    db.project.findMany({ where }),
    db.certification.findMany({ where }),
    db.achievement.findMany({ where }),
    db.publication.findMany({ where }),
    db.research.findMany({ where }),
    db.conference.findMany({ where }),
    db.service.findMany({ where }),
    db.caseStudy.findMany({ where }),
    db.testimonial.findMany({ where }),
    db.document.findMany({ where }),
    db.documentVersion.findMany({ where, select: { id: true, label: true, templateId: true, createdAt: true } }),
    db.portfolio.findUnique({ where }),
    db.application.findMany({ where }),
    db.shareLink.findMany({ where, select: { label: true, views: true, createdAt: true, expiresAt: true, revokedAt: true } }),
    db.aIRequest.findMany({ where, select: { task: true, createdAt: true, accepted: true } }),
    db.analyticsEvent.count({ where }),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    notice:
      "This is everything NextProfile stores about your account. Version snapshots are listed by name only; download individual versions as PDFs from the app. Analytics are stored as a count with a daily-rotating visitor hash — no IP addresses are kept, so they cannot be tied back to individual people.",
    account,
    profile,
    record: {
      educations, experiences, skills, projects, certifications, achievements,
      publications, researches, conferences, services, caseStudies, testimonials,
    },
    documents,
    versions,
    portfolio,
    applications,
    shareLinks,
    aiRequests,
    analyticsEventCount: events,
  }

  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="nextprofile-export-${stamp}.json"`,
      "Cache-Control": "private, no-store",
    },
  })
}
