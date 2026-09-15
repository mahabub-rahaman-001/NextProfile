import type { ProfileType } from "@prisma/client"
import { MODULE_KEYS, type ModuleKey } from "@/lib/types"

/**
 * Module visibility — the switch that makes one application serve five kinds
 * of user. See docs/00-PRODUCT-PLAN.md §8 for the matrix this mirrors.
 *
 *   default   — shown in the builder straight away
 *   available — offered under "Add a section"
 *   hidden    — not offered up front, but never forbidden
 *
 * This is a pure function. It never touches the database, and it is the single
 * source of truth for which modules a profile type sees.
 */
export type Visibility = "default" | "available" | "hidden"

/** The nine onboarding choices collapse onto five real configurations. */
export function normaliseType(type: ProfileType): CoreType {
  switch (type) {
    case "STUDENT":
      return "STUDENT"
    case "RESEARCHER":
      return "RESEARCHER"
    case "FREELANCER":
      return "FREELANCER"
    case "CREATIVE":
      return "CREATIVE"
    // Job seekers, teachers, entrepreneurs and everyone else get the
    // professional configuration and adjust from there.
    default:
      return "PROFESSIONAL"
  }
}

export type CoreType = "STUDENT" | "PROFESSIONAL" | "RESEARCHER" | "FREELANCER" | "CREATIVE"

const D: Visibility = "default"
const A: Visibility = "available"
const H: Visibility = "hidden"

export const MATRIX: Record<CoreType, Record<ModuleKey, Visibility>> = {
  STUDENT: {
    basics: D,
    education: D,
    skills: D,
    projects: D,
    certifications: D,
    achievements: D,
    experience: A,
    publications: A,
    research: A,
    conferences: H,
    services: H,
    caseStudies: H,
    testimonials: H,
  },
  PROFESSIONAL: {
    basics: D,
    experience: D,
    skills: D,
    projects: D,
    education: D,
    certifications: D,
    achievements: D,
    conferences: A,
    caseStudies: A,
    testimonials: A,
    publications: A,
    research: H,
    services: H,
  },
  RESEARCHER: {
    basics: D,
    education: D,
    publications: D,
    research: D,
    conferences: D,
    experience: D,
    achievements: D,
    skills: D,
    projects: A,
    certifications: A,
    services: H,
    caseStudies: H,
    testimonials: H,
  },
  FREELANCER: {
    basics: D,
    services: D,
    caseStudies: D,
    projects: D,
    skills: D,
    testimonials: D,
    education: A,
    experience: A,
    achievements: A,
    certifications: A,
    conferences: A,
    publications: H,
    research: H,
  },
  CREATIVE: {
    basics: D,
    projects: D,
    caseStudies: D,
    services: D,
    skills: D,
    testimonials: D,
    experience: A,
    education: A,
    achievements: A,
    conferences: A,
    certifications: H,
    publications: H,
    research: H,
  },
}

/** Field-level hints that narrow a module further by discipline. */
const FIELD_HINTS: Record<string, { links: string[]; skillCategories: string[] }> = {
  cse: {
    links: ["github", "linkedin", "website"],
    skillCategories: ["Languages", "Frameworks", "Tools", "Soft skills"],
  },
  business: {
    links: ["linkedin", "website"],
    skillCategories: ["Business", "Analytics", "Tools", "Soft skills"],
  },
  design: {
    links: ["behance", "dribbble", "website", "linkedin"],
    skillCategories: ["Design", "Tools", "Methods", "Soft skills"],
  },
  research: {
    links: ["scholar", "orcid", "linkedin", "website"],
    skillCategories: ["Methods", "Technical", "Languages", "Tools"],
  },
  law: {
    links: ["linkedin", "website"],
    skillCategories: ["Practice areas", "Research", "Languages", "Soft skills"],
  },
}

const DEFAULT_HINTS = {
  links: ["linkedin", "website"],
  skillCategories: ["Technical", "Tools", "Languages", "Soft skills"],
}

export type ModuleConfig = {
  visible: ModuleKey[]
  available: ModuleKey[]
  hidden: ModuleKey[]
  hints: { links: string[]; skillCategories: string[] }
}

/**
 * @param type        the user's profile type
 * @param discipline  optional field of study or practice
 * @param withData    modules that already contain entries — always shown,
 *                    whatever the matrix says, so changing profile type can
 *                    never hide a user's existing content.
 */
export function getModules(
  type: ProfileType,
  discipline?: string | null,
  withData: ModuleKey[] = [],
): ModuleConfig {
  const row = MATRIX[normaliseType(type)]
  const has = new Set(withData)

  const visible: ModuleKey[] = []
  const available: ModuleKey[] = []
  const hidden: ModuleKey[] = []

  for (const key of MODULE_KEYS) {
    const state = has.has(key) ? "default" : row[key]
    if (state === "default") visible.push(key)
    else if (state === "available") available.push(key)
    else hidden.push(key)
  }

  return {
    visible,
    available,
    hidden,
    hints: FIELD_HINTS[(discipline ?? "").toLowerCase()] ?? DEFAULT_HINTS,
  }
}

/** Recommended template and theme, pre-selected but always changeable. */
export function getRecommendations(type: ProfileType) {
  switch (normaliseType(type)) {
    case "RESEARCHER":
      return { templateId: "minimal", themeId: "minimal", docKind: "CV" as const }
    case "CREATIVE":
      return { templateId: "modern", themeId: "modern", docKind: "RESUME" as const }
    case "FREELANCER":
      return { templateId: "modern", themeId: "modern", docKind: "RESUME" as const }
    case "PROFESSIONAL":
      return { templateId: "professional", themeId: "professional", docKind: "RESUME" as const }
    default:
      return { templateId: "minimal", themeId: "minimal", docKind: "RESUME" as const }
  }
}
