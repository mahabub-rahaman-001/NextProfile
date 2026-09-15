import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"

const live = { deletedAt: null }
const byOrder = { sortOrder: "asc" as const }

const include = {
  profile: true,
  portfolio: true,
  educations: { where: live, orderBy: byOrder },
  experiences: { where: live, orderBy: byOrder },
  skills: { where: live, orderBy: byOrder },
  projects: { where: live, orderBy: byOrder },
  certifications: { where: live, orderBy: byOrder },
  achievements: { where: live, orderBy: byOrder },
  publications: { where: live, orderBy: byOrder },
  researches: { where: live, orderBy: byOrder },
  conferences: { where: live, orderBy: byOrder },
  services: { where: live, orderBy: byOrder },
  caseStudies: { where: live, orderBy: byOrder },
  testimonials: { where: live, orderBy: byOrder },
} satisfies Prisma.UserInclude

export type FullProfile = Prisma.UserGetPayload<{ typeof: never; include: typeof include }>

/** Everything needed to render any document, theme or public page. One query. */
export async function loadFullProfile(userId: string) {
  return db.user.findUnique({ where: { id: userId }, include })
}

/** The public page's query — by username, never by id. */
export async function loadPublicProfile(username: string) {
  return db.user.findUnique({ where: { username }, include })
}

export type ProfileData = NonNullable<Awaited<ReturnType<typeof loadFullProfile>>>

/** Contact and links are JSON columns; read them through these. */
export type Contact = {
  email?: string
  phone?: string
  showEmail?: boolean
  showPhone?: boolean
  showLocation?: boolean
}

export type Links = Partial<
  Record<"website" | "github" | "linkedin" | "behance" | "dribbble" | "scholar" | "orcid" | "x", string>
>

export function contactOf(p: { contact: unknown } | null | undefined): Contact {
  return (p?.contact ?? {}) as Contact
}

export function linksOf(p: { links: unknown } | null | undefined): Links {
  return (p?.links ?? {}) as Links
}

/** Only what the user chose to publish. Used by every public surface. */
export function publicContact(p: { contact: unknown } | null | undefined): Contact {
  const c = contactOf(p)
  return {
    email: c.showEmail ? c.email : undefined,
    phone: c.showPhone ? c.phone : undefined,
    showLocation: c.showLocation !== false,
  }
}
