import type { ProfileType } from "@prisma/client"
import { MODULE_LABELS, type ModuleKey } from "@/lib/types"
import { normaliseType, type CoreType } from "@/lib/modules"

/**
 * Profile completeness — the single most effective nudge in the product, so it
 * has to be honest and profile-aware. A researcher with no publications must
 * not be able to reach 100%.
 *
 * Pure function: data in, score out. Cached on Profile.completeness by the
 * caller; never computed on page load.
 */

export const WEIGHTS: Record<CoreType, Partial<Record<ModuleKey, number>>> = {
  STUDENT: {
    basics: 15,
    education: 20,
    skills: 15,
    projects: 20,
    experience: 10,
    achievements: 10,
    certifications: 10,
  },
  PROFESSIONAL: {
    basics: 15,
    experience: 30,
    skills: 20,
    projects: 15,
    education: 10,
    achievements: 10,
  },
  RESEARCHER: {
    basics: 15,
    education: 20,
    publications: 25,
    research: 20,
    experience: 10,
    conferences: 10,
  },
  FREELANCER: {
    basics: 15,
    services: 25,
    caseStudies: 25,
    skills: 15,
    testimonials: 10,
    projects: 10,
  },
  CREATIVE: {
    basics: 15,
    projects: 25,
    caseStudies: 20,
    services: 15,
    skills: 15,
    testimonials: 10,
  },
}

/** One entry is a start, three is a real section. */
export function fillRatio(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 0.6
  if (count === 2) return 0.85
  return 1
}

export type BasicsInput = {
  fullName?: string | null
  headline?: string | null
  about?: string | null
  photoUrl?: string | null
  location?: string | null
  contactEmail?: string | null
}

/** Basics score on substance, not mere presence — a two-word "about" is not an about. */
export function basicsRatio(b: BasicsInput): number {
  const checks = [
    (b.fullName ?? "").trim().length > 1,
    (b.headline ?? "").trim().length >= 10,
    (b.about ?? "").trim().split(/\s+/).filter(Boolean).length >= 25,
    Boolean(b.photoUrl),
    (b.location ?? "").trim().length > 1,
    Boolean(b.contactEmail),
  ]
  return checks.filter(Boolean).length / checks.length
}

export type Missing = { key: ModuleKey; label: string; gain: number }

export type CompletenessResult = {
  score: number
  missing: Missing[]
  breakdown: { key: ModuleKey; label: string; weight: number; ratio: number }[]
}

export function computeCompleteness(
  profileType: ProfileType,
  basics: BasicsInput,
  counts: Partial<Record<ModuleKey, number>>,
): CompletenessResult {
  const weights = WEIGHTS[normaliseType(profileType)]
  let total = 0
  const breakdown: CompletenessResult["breakdown"] = []
  const missing: Missing[] = []

  for (const [k, weight] of Object.entries(weights) as [ModuleKey, number][]) {
    const ratio = k === "basics" ? basicsRatio(basics) : fillRatio(counts[k] ?? 0)
    total += weight * ratio
    breakdown.push({ key: k, label: MODULE_LABELS[k], weight, ratio })
    if (ratio < 1) {
      missing.push({
        key: k,
        label: MODULE_LABELS[k],
        gain: Math.round(weight * (1 - ratio)),
      })
    }
  }

  return {
    score: Math.round(total),
    // Name the two highest-value missing items. "Add one project (+20%)"
    // outperforms "Your profile is incomplete."
    missing: missing.sort((a, b) => b.gain - a.gain).slice(0, 2),
    breakdown: breakdown.sort((a, b) => b.weight - a.weight),
  }
}
