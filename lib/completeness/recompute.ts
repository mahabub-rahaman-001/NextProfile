import { db } from "@/lib/db"
import type { ModuleKey } from "@/lib/types"
import { computeCompleteness, type CompletenessResult } from "./index"

const LIVE = { deletedAt: null as Date | null }

/**
 * Counts every record module for a user, scores the profile and caches the
 * result on Profile.completeness. Call after every profile write — never on
 * page load.
 */
export async function recomputeCompleteness(userId: string): Promise<CompletenessResult> {
  const profile = await db.profile.findUnique({ where: { userId } })
  if (!profile) throw new Error("No profile for user")

  const where = { userId, ...LIVE }
  const [
    education,
    experience,
    skills,
    projects,
    certifications,
    achievements,
    publications,
    research,
    conferences,
    services,
    caseStudies,
    testimonials,
  ] = await Promise.all([
    db.education.count({ where }),
    db.experience.count({ where }),
    db.skill.count({ where }),
    db.project.count({ where }),
    db.certification.count({ where }),
    db.achievement.count({ where }),
    db.publication.count({ where }),
    db.research.count({ where }),
    db.conference.count({ where }),
    db.service.count({ where }),
    db.caseStudy.count({ where }),
    db.testimonial.count({ where }),
  ])

  const counts: Partial<Record<ModuleKey, number>> = {
    education,
    experience,
    skills,
    projects,
    certifications,
    achievements,
    publications,
    research,
    conferences,
    services,
    caseStudies,
    testimonials,
  }

  const contact = (profile.contact ?? {}) as { email?: string }
  const result = computeCompleteness(
    profile.profileType,
    {
      fullName: profile.fullName,
      headline: profile.headline,
      about: profile.about,
      photoUrl: profile.photoUrl,
      location: profile.location,
      contactEmail: contact.email,
    },
    counts,
  )

  await db.profile.update({
    where: { userId },
    data: {
      completeness: result.score,
      // Cache the whole result. The dashboard reads this instead of running
      // twelve COUNT queries and a write on every page view.
      completenessDetail: { score: result.score, missing: result.missing },
    },
  })

  return result
}

/**
 * What the dashboard uses: the cached result, with a recompute only if it has
 * never been calculated (an account created before this cache existed).
 */
export async function readCompleteness(userId: string): Promise<CompletenessResult> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { completeness: true, completenessDetail: true },
  })
  if (!profile) throw new Error("No profile for user")

  const cached = profile.completenessDetail as { score?: number; missing?: CompletenessResult["missing"] }
  if (typeof cached?.score === "number" && Array.isArray(cached.missing)) {
    return { score: cached.score, missing: cached.missing, breakdown: [] }
  }

  return recomputeCompleteness(userId)
}

/** Which modules already hold data — so changing profile type never hides content. */
export async function modulesWithData(userId: string): Promise<ModuleKey[]> {
  const where = { userId, ...LIVE }
  const pairs: [ModuleKey, Promise<number>][] = [
    ["education", db.education.count({ where })],
    ["experience", db.experience.count({ where })],
    ["skills", db.skill.count({ where })],
    ["projects", db.project.count({ where })],
    ["certifications", db.certification.count({ where })],
    ["achievements", db.achievement.count({ where })],
    ["publications", db.publication.count({ where })],
    ["research", db.research.count({ where })],
    ["conferences", db.conference.count({ where })],
    ["services", db.service.count({ where })],
    ["caseStudies", db.caseStudy.count({ where })],
    ["testimonials", db.testimonial.count({ where })],
  ]
  const counts = await Promise.all(pairs.map(([, p]) => p))
  return pairs.filter((_, i) => counts[i] > 0).map(([k]) => k)
}
