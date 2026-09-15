import type { ProfileType } from "@prisma/client"
import { db } from "@/lib/db"
import { normaliseType } from "@/lib/modules"
import { PROFILE_TYPE_LABELS } from "@/lib/types"

/**
 * "More complete than 68% of students" is a stronger completion driver than any
 * progress bar. Compared only against the same profile type, only against
 * people who finished onboarding, and only as an aggregate — no individual is
 * ever identified.
 */
export type PeerComparison = {
  percentile: number
  cohortSize: number
  cohortLabel: string
  median: number
} | null

const MIN_COHORT = 5 // below this, the number says more about us than about them

export async function comparePeers(
  userId: string,
  profileType: ProfileType,
  score: number,
): Promise<PeerComparison> {
  const core = normaliseType(profileType)

  const types: ProfileType[] =
    core === "PROFESSIONAL"
      ? ["PROFESSIONAL", "JOB_SEEKER", "TEACHER", "ENTREPRENEUR", "OTHER"]
      : [profileType]

  const cohort = {
    userId: { not: userId },
    profileType: { in: types },
    onboardedAt: { not: null },
  }

  // Counted in the database, not in Node. Reading every peer row to produce one
  // percentile meant a full-table read on every dashboard load, growing with
  // signups. These two counts answer the same question at any size.
  const [cohortSize, below] = await Promise.all([
    db.profile.count({ where: cohort }),
    db.profile.count({ where: { ...cohort, completeness: { lt: score } } }),
  ])

  if (cohortSize < MIN_COHORT) return null

  // The median is the middle row of the cohort ordered by score — fetched by
  // offset so exactly one row comes back. Same index the previous in-memory
  // sort used, so the number on screen is unchanged.
  const middle = await db.profile.findMany({
    where: cohort,
    select: { completeness: true },
    orderBy: { completeness: "asc" },
    skip: Math.floor(cohortSize / 2),
    take: 1,
  })

  return {
    percentile: Math.round((below / cohortSize) * 100),
    cohortSize,
    cohortLabel: PROFILE_TYPE_LABELS[profileType].toLowerCase(),
    median: middle[0]?.completeness ?? 0,
  }
}
