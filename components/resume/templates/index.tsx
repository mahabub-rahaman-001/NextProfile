import type { DocKind } from "@prisma/client"
import type { ProfileData } from "@/lib/profile/load"
import type { DocConfig } from "@/lib/validation"
import { resolveSections } from "../engine/resolve"
import { MinimalTemplate } from "./minimal"
import { ProfessionalTemplate } from "./professional"
import { ModernTemplate } from "./modern"
import type { TemplateProps } from "./types"

export const TEMPLATES = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    blurb: "Single column, generous spacing. The safe choice for online applications.",
    atsSafe: true,
    Component: MinimalTemplate,
  },
  professional: {
    id: "professional",
    name: "Professional",
    blurb: "Two columns with a sidebar for skills and contact. Best for email and print.",
    atsSafe: false,
    Component: ProfessionalTemplate,
  },
  modern: {
    id: "modern",
    name: "Modern",
    blurb: "Accent rules and tighter density. Good for design-adjacent roles.",
    atsSafe: false,
    Component: ModernTemplate,
  },
} as const

export type TemplateId = keyof typeof TEMPLATES

export function isTemplateId(s: string): s is TemplateId {
  return s in TEMPLATES
}

export function DocumentRenderer({
  data,
  kind,
  templateId,
  config,
}: {
  data: ProfileData
  kind: DocKind
  templateId: string
  config: Partial<DocConfig>
}) {
  const id: TemplateId = isTemplateId(templateId) ? templateId : "minimal"
  const { Component } = TEMPLATES[id]
  const sections = resolveSections(data, kind, config)

  const props: TemplateProps = {
    profile: data.profile!,
    sections,
    config: {
      density: config.density ?? "regular",
      accent: config.accent ?? "#0E5C4A",
      paper: config.paper ?? "A4",
    },
  }

  return <Component {...props} />
}
