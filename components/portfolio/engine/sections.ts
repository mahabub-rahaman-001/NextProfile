import { normaliseType, type CoreType } from "@/lib/modules"
import type { ProfileData } from "@/lib/profile/load"
import type { PortfolioConfig } from "@/lib/validation"

export const PORTFOLIO_SECTION_TITLES: Record<string, string> = {
  about: "About",
  services: "Services",
  caseStudies: "Selected work",
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  publications: "Publications",
  research: "Research",
  conferences: "Talks & conferences",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  testimonials: "What people say",
  contact: "Contact",
}

const ORDER: Record<CoreType, string[]> = {
  STUDENT: ["about", "projects", "education", "skills", "experience", "achievements", "certifications", "contact"],
  PROFESSIONAL: ["about", "experience", "projects", "skills", "education", "achievements", "certifications", "contact"],
  RESEARCHER: ["about", "publications", "research", "conferences", "education", "experience", "skills", "achievements", "contact"],
  FREELANCER: ["about", "services", "caseStudies", "projects", "testimonials", "skills", "experience", "contact"],
  CREATIVE: ["about", "projects", "caseStudies", "services", "testimonials", "skills", "experience", "contact"],
}

export function defaultPortfolioOrder(data: ProfileData): string[] {
  return ORDER[normaliseType(data.profile?.profileType ?? "STUDENT")]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sectionItems(key: string, d: ProfileData): any[] {
  switch (key) {
    case "projects":
      return d.projects
    case "experience":
      return d.experiences
    case "education":
      return d.educations
    case "skills":
      return d.skills
    case "publications":
      return d.publications
    case "research":
      return d.researches
    case "conferences":
      return d.conferences
    case "services":
      return d.services
    case "caseStudies":
      return d.caseStudies
    case "testimonials":
      return d.testimonials
    case "certifications":
      return d.certifications
    case "achievements":
      return d.achievements
    default:
      return []
  }
}

export type PortfolioSection = { key: string; title: string; items: unknown[] }

/** Sections with something in them, in the user's chosen order. */
export function resolvePortfolio(
  data: ProfileData,
  config: Partial<PortfolioConfig>,
): PortfolioSection[] {
  const configured = config.sections?.length
    ? config.sections.filter((s) => s.visible).map((s) => s.id)
    : defaultPortfolioOrder(data)

  return configured
    .map((key) => ({ key, title: PORTFOLIO_SECTION_TITLES[key] ?? key, items: sectionItems(key, data) }))
    .filter((s) => {
      if (s.key === "about") return Boolean(data.profile?.about)
      if (s.key === "contact") return true
      return s.items.length > 0
    })
}

/** Every section that could be shown — for the visibility toggles. */
export function availablePortfolioSections(data: ProfileData): string[] {
  const order = defaultPortfolioOrder(data)
  const rest = Object.keys(PORTFOLIO_SECTION_TITLES).filter((k) => !order.includes(k))
  return [...order, ...rest].filter((key) => {
    if (key === "about") return Boolean(data.profile?.about)
    if (key === "contact") return true
    return sectionItems(key, data).length > 0
  })
}
