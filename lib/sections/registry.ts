import { z } from "zod"
import { db } from "@/lib/db"
import * as V from "@/lib/validation"
import type { ModuleKey } from "@/lib/types"

/**
 * Twelve record types share one CRUD implementation. Adding a thirteenth means
 * one line here, one Zod schema, and one field config — nothing else.
 */
export const SECTIONS = {
  education: { model: "education", module: "education", schema: V.educationSchema },
  experience: { model: "experience", module: "experience", schema: V.experienceSchema },
  skills: { model: "skill", module: "skills", schema: V.skillSchema },
  projects: { model: "project", module: "projects", schema: V.projectSchema },
  certifications: { model: "certification", module: "certifications", schema: V.certificationSchema },
  achievements: { model: "achievement", module: "achievements", schema: V.achievementSchema },
  publications: { model: "publication", module: "publications", schema: V.publicationSchema },
  research: { model: "research", module: "research", schema: V.researchSchema },
  conferences: { model: "conference", module: "conferences", schema: V.conferenceSchema },
  services: { model: "service", module: "services", schema: V.serviceSchema },
  "case-studies": { model: "caseStudy", module: "caseStudies", schema: V.caseStudySchema },
  testimonials: { model: "testimonial", module: "testimonials", schema: V.testimonialSchema },
} as const satisfies Record<string, { model: string; module: ModuleKey; schema: z.ZodTypeAny }>

export type SectionSlug = keyof typeof SECTIONS

export function isSectionSlug(s: string): s is SectionSlug {
  return s in SECTIONS
}

/** Runtime Prisma delegate for a section. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function delegate(slug: SectionSlug): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)[SECTIONS[slug].model]
}

export const MODULE_TO_SLUG: Record<Exclude<ModuleKey, "basics">, SectionSlug> = {
  education: "education",
  experience: "experience",
  skills: "skills",
  projects: "projects",
  certifications: "certifications",
  achievements: "achievements",
  publications: "publications",
  research: "research",
  conferences: "conferences",
  services: "services",
  caseStudies: "case-studies",
  testimonials: "testimonials",
}
