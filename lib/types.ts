import type { ProfileType, CareerGoal } from "@prisma/client"

export type { ProfileType, CareerGoal }

/**
 * A module is one section of the career record.
 * These keys are the vocabulary shared by the profile builder, the module
 * visibility matrix, the completeness scorer, the resume engine and the
 * portfolio engine. Adding a section means adding a key here first.
 */
export const MODULE_KEYS = [
  "basics",
  "education",
  "experience",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "publications",
  "research",
  "conferences",
  "services",
  "caseStudies",
  "testimonials",
] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

/** Route segment ↔ module key. Used by the section CRUD factory. */
export const MODULE_SLUGS: Record<Exclude<ModuleKey, "basics">, string> = {
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

export const MODULE_LABELS: Record<ModuleKey, string> = {
  basics: "Basic information",
  education: "Education",
  experience: "Work experience",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements & activities",
  publications: "Publications",
  research: "Research & thesis",
  conferences: "Conferences & talks",
  services: "Services",
  caseStudies: "Case studies",
  testimonials: "Testimonials",
}

/** Singular nouns, for empty states and buttons: "Add an education entry". */
export const MODULE_ITEM_LABELS: Record<Exclude<ModuleKey, "basics">, string> = {
  education: "education entry",
  experience: "job",
  skills: "skill",
  projects: "project",
  certifications: "certification",
  achievements: "achievement",
  publications: "publication",
  research: "research entry",
  conferences: "conference or talk",
  services: "service",
  caseStudies: "case study",
  testimonials: "testimonial",
}

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  STUDENT: "Student",
  JOB_SEEKER: "Job seeker",
  PROFESSIONAL: "Working professional",
  FREELANCER: "Freelancer",
  RESEARCHER: "Researcher",
  TEACHER: "Teacher",
  CREATIVE: "Creative professional",
  ENTREPRENEUR: "Entrepreneur",
  OTHER: "Something else",
}

export const CAREER_GOAL_LABELS: Record<CareerGoal, string> = {
  INTERNSHIP: "Find an internship",
  FIND_JOB: "Find a job",
  HIGHER_STUDY: "Apply for higher study",
  FREELANCE_CLIENTS: "Find freelance clients",
  BUILD_PORTFOLIO: "Build a portfolio",
  PROFESSIONAL_PRESENCE: "Build professional presence",
  PROMOTE_SERVICES: "Promote my services",
  PERSONAL_BRAND: "Build a personal brand",
}

export type Wants = "resume" | "cv" | "portfolio" | "profile"

export const WANT_LABELS: Record<Wants, string> = {
  resume: "Resume",
  cv: "Academic CV",
  portfolio: "Portfolio website",
  profile: "Public profile",
}

/** Section keys a resume or portfolio can render, in addition to the record modules. */
export type SectionKey = ModuleKey | "summary" | "hero" | "contact" | "links"
