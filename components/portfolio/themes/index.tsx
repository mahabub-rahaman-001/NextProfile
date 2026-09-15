import type { ProfileData } from "@/lib/profile/load"
import type { PortfolioConfig } from "@/lib/validation"
import { resolvePortfolio } from "../engine/sections"
import { MinimalTheme } from "./minimal"
import { ProfessionalTheme } from "./professional"
import { ModernTheme } from "./modern"
import { EditorialTheme } from "./editorial"
import { TerminalTheme } from "./terminal"
import { CardsTheme } from "./cards"
import { SidebarTheme } from "./sidebar"
import { TimelineTheme } from "./timeline"
import { GalleryTheme } from "./gallery"
import { ClassicTheme } from "./classic"
import type { ThemeProps } from "./types"

/**
 * Ten themes. Each differs in LAYOUT — where identity sits, how work is
 * presented, how sections are separated — not in colour. If two of them are
 * indistinguishable in a thumbnail, there are really only nine.
 *
 * `suits` drives the recommendation in the picker; it never restricts choice.
 */
export const THEMES = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    blurb: "Type-led, one column. Work listed as rows, nothing competing with it.",
    suits: ["STUDENT", "RESEARCHER"],
    Component: MinimalTheme,
  },
  professional: {
    id: "professional",
    name: "Professional",
    blurb: "Contact panel beside the content, projects in a card grid.",
    suits: ["PROFESSIONAL"],
    Component: ProfessionalTheme,
  },
  modern: {
    id: "modern",
    name: "Modern",
    blurb: "Large hero, generous spacing, projects presented as full blocks.",
    suits: ["FREELANCER", "CREATIVE"],
    Component: ModernTheme,
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    blurb: "A magazine feature: oversized serif headline and numbered sections.",
    suits: ["CREATIVE", "PROFESSIONAL"],
    Component: EditorialTheme,
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    blurb: "Monospace and dark, framed as shell output. For developers who mean it.",
    suits: ["STUDENT"],
    Component: TerminalTheme,
  },
  cards: {
    id: "cards",
    name: "Cards",
    blurb: "Every section a panel on a tinted ground. Dense and quick to scan.",
    suits: ["PROFESSIONAL", "STUDENT"],
    Component: CardsTheme,
  },
  sidebar: {
    id: "sidebar",
    name: "Sidebar",
    blurb: "Photo, name and contact pinned on the left while the work scrolls.",
    suits: ["PROFESSIONAL", "FREELANCER"],
    Component: SidebarTheme,
  },
  timeline: {
    id: "timeline",
    name: "Timeline",
    blurb: "A spine down the page, each section a stop along it.",
    suits: ["STUDENT", "PROFESSIONAL"],
    Component: TimelineTheme,
  },
  gallery: {
    id: "gallery",
    name: "Gallery",
    blurb: "Work first: project images edge to edge, words kept quiet beneath.",
    suits: ["CREATIVE", "FREELANCER"],
    Component: GalleryTheme,
  },
  classic: {
    id: "classic",
    name: "Classic",
    blurb: "Centred, formal, serif. The academic register, for a CV that must look plain.",
    suits: ["RESEARCHER"],
    Component: ClassicTheme,
  },
} as const

export type ThemeId = keyof typeof THEMES

export const THEME_IDS = Object.keys(THEMES) as ThemeId[]

export function isThemeId(s: string): s is ThemeId {
  return s in THEMES
}

export function PortfolioRenderer({
  data,
  themeId,
  config,
}: {
  data: ProfileData
  themeId: string
  config: Partial<PortfolioConfig>
}) {
  const id: ThemeId = isThemeId(themeId) ? themeId : "minimal"
  const { Component } = THEMES[id]
  const sections = resolvePortfolio(data, config)

  const props: ThemeProps = {
    data,
    sections,
    accent: config.accent ?? "#0E5C4A",
  }

  return <Component {...props} />
}
