import type { DocKind } from "@prisma/client"
import { normaliseType, type CoreType } from "@/lib/modules"
import type { ProfileData } from "@/lib/profile/load"
import type { DocConfig } from "@/lib/validation"

/**
 * The bridge between stored data and a template.
 *
 * Templates receive resolved sections and never query anything. They must
 * render ANY section set, including one they have not seen — which is what
 * lets a researcher's CV and a freelancer's resume share one renderer.
 */

export type SectionKind =
  | "text"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "publications"
  | "simple"
  | "quotes"

export type ResolvedSection = {
  key: string
  title: string
  kind: SectionKind
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
  text?: string
}

export const SECTION_TITLES: Record<string, string> = {
  summary: "Summary",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  publications: "Publications",
  research: "Research",
  conferences: "Conferences & Talks",
  services: "Services",
  caseStudies: "Selected Work",
  testimonials: "Testimonials",
}

const RESUME_ORDER: Record<CoreType, string[]> = {
  STUDENT: ["summary", "education", "projects", "experience", "skills", "certifications", "achievements"],
  PROFESSIONAL: ["summary", "experience", "projects", "skills", "education", "achievements", "certifications"],
  RESEARCHER: ["summary", "education", "publications", "research", "experience", "conferences", "skills", "achievements"],
  FREELANCER: ["summary", "services", "caseStudies", "projects", "skills", "testimonials", "experience", "education"],
  CREATIVE: ["summary", "projects", "caseStudies", "services", "skills", "experience", "education", "testimonials"],
}

/** A CV is not a long resume: education and publications lead, by convention. */
const CV_ORDER: string[] = [
  "summary",
  "education",
  "publications",
  "research",
  "conferences",
  "experience",
  "achievements",
  "certifications",
  "skills",
  "projects",
]

export function defaultOrder(profileType: ProfileData["profile"], kind: DocKind): string[] {
  if (kind === "CV") return CV_ORDER
  const core = normaliseType(profileType?.profileType ?? "STUDENT")
  return RESUME_ORDER[core]
}

const KINDS: Record<string, SectionKind> = {
  summary: "text",
  education: "education",
  experience: "experience",
  projects: "projects",
  skills: "skills",
  publications: "publications",
  certifications: "simple",
  achievements: "simple",
  research: "simple",
  conferences: "simple",
  services: "simple",
  caseStudies: "simple",
  testimonials: "quotes",
}

function itemsFor(key: string, p: ProfileData) {
  switch (key) {
    case "education":
      return p.educations
    case "experience":
      return p.experiences
    case "projects":
      return p.projects
    case "skills":
      return p.skills
    case "certifications":
      return p.certifications
    case "achievements":
      return p.achievements
    case "publications":
      return p.publications
    case "research":
      return p.researches
    case "conferences":
      return p.conferences
    case "services":
      return p.services
    case "caseStudies":
      return p.caseStudies
    case "testimonials":
      return p.testimonials
    default:
      return []
  }
}

/** Simple sections render as title + subtitle + note; map each source to that. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function simpleShape(key: string, item: any) {
  switch (key) {
    case "certifications":
      return { title: item.name, subtitle: item.issuer, date: item.issueDate, note: null }
    case "achievements":
      return { title: item.title, subtitle: item.issuer, date: item.date, note: item.description }
    case "research":
      return { title: item.title, subtitle: item.institution, date: item.endDate ?? item.startDate, note: item.abstract }
    case "conferences":
      return { title: item.title, subtitle: [item.event, item.role].filter(Boolean).join(" · "), date: item.date, note: null }
    case "services":
      return { title: item.title, subtitle: item.deliverable, date: null, note: item.description }
    case "caseStudies":
      return { title: item.title, subtitle: item.client, date: null, note: item.outcome }
    default:
      return { title: item.title ?? item.name ?? "", subtitle: null, date: null, note: null }
  }
}

export function resolveSections(
  data: ProfileData,
  kind: DocKind,
  config: Partial<DocConfig>,
): ResolvedSection[] {
  const order = config.sectionOrder?.length
    ? config.sectionOrder
    : defaultOrder(data.profile, kind)
  const hidden = new Set(config.hidden ?? [])

  const sections: ResolvedSection[] = []

  for (const key of order) {
    if (hidden.has(key)) continue

    if (key === "summary") {
      const text = data.profile?.about?.trim()
      if (text) sections.push({ key, title: SECTION_TITLES.summary, kind: "text", items: [], text })
      continue
    }

    const items = itemsFor(key, data)
    if (!items?.length) continue // empty sections never reach the template

    sections.push({
      key,
      title: SECTION_TITLES[key] ?? key,
      kind: KINDS[key] ?? "simple",
      items,
    })
  }

  return sections
}

/** Every section this profile could show, for the visibility toggles in the editor. */
export function availableSections(data: ProfileData, kind: DocKind): string[] {
  const order = defaultOrder(data.profile, kind)
  const rest = Object.keys(SECTION_TITLES).filter((k) => !order.includes(k))
  return [...order, ...rest].filter((key) => {
    if (key === "summary") return Boolean(data.profile?.about)
    return itemsFor(key, data).length > 0
  })
}
