import type { Profile } from "@prisma/client"
import type { ResolvedSection } from "../engine/resolve"

export type TemplateProps = {
  profile: Profile
  sections: ResolvedSection[]
  config: {
    density: "compact" | "regular" | "spacious"
    accent: string
    paper: "A4" | "LETTER"
  }
}

/**
 * Contact line for a RESUME or CV.
 *
 * These documents always carry the contact details the user entered — a resume
 * an employer cannot reply to is worthless, and sending one is itself the act
 * of sharing.
 *
 * The show/hide switches in Basic information govern the PUBLIC profile at
 * /u/username, where strangers browse. They deliberately do NOT apply here.
 * (This was a real bug: new accounts default those switches off, so every
 * resume downloaded before the fix went out with no email and no phone.)
 */
export function contactLine(profile: Profile): string[] {
  const c = (profile.contact ?? {}) as { email?: string; phone?: string }
  return [profile.location, c.email, c.phone].filter(Boolean) as string[]
}

export function linkLine(profile: Profile): string[] {
  const l = (profile.links ?? {}) as Record<string, string>
  return Object.values(l)
    .filter(Boolean)
    .map((u) => u.replace(/^https?:\/\//, "").replace(/\/$/, ""))
}

/** Profile photo, for the templates that show one. Minimal never does (ATS). */
export function photoOf(profile: Profile): string | null {
  return profile.photoUrl?.trim() ? profile.photoUrl : null
}
