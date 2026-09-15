import type { ProfileData } from "@/lib/profile/load"
import { contactOf, linksOf } from "@/lib/profile/load"

/**
 * Profile review — the things a person reading a hundred applications notices
 * in the first ten seconds.
 *
 * Deliberately rule-based, not a model call: every finding must be specific,
 * reproducible, and defensible. "3 of your 8 bullet points describe duties
 * rather than results" is useful. "Your profile could be stronger" is not.
 */

export type Severity = "high" | "medium" | "low"

export type Finding = {
  id: string
  severity: Severity
  title: string
  detail: string
  href: string
  /** How many items this applies to, when that is the point. */
  count?: number
}

export type ReviewResult = {
  score: number
  findings: Finding[]
  passed: string[]
}

const WEIGHT: Record<Severity, number> = { high: 12, medium: 6, low: 2 }

/** Openers that describe a duty instead of a result. */
const WEAK_OPENERS = [
  "responsible for",
  "worked on",
  "helped with",
  "assisted with",
  "duties included",
  "tasked with",
  "involved in",
  "participated in",
  "in charge of",
]

const HAS_NUMBER = /\d/

function words(s: string | null | undefined) {
  return (s ?? "").trim().split(/\s+/).filter(Boolean).length
}

export function reviewProfile(data: ProfileData): ReviewResult {
  const findings: Finding[] = []
  const passed: string[] = []
  const p = data.profile
  const contact = contactOf(p)
  const links = linksOf(p)

  const add = (f: Finding) => findings.push(f)

  // ---------------------------------------------------------------- headline
  if (!p?.headline?.trim()) {
    add({
      id: "headline-missing",
      severity: "high",
      title: "You have no headline",
      detail:
        "The line under your name is the first thing anyone reads, and it is what a search result shows. One line: what you do, and what you are moving towards.",
      href: "/dashboard/profile/basics",
    })
  } else if (words(p.headline) < 3) {
    add({
      id: "headline-thin",
      severity: "medium",
      title: "Your headline is very short",
      detail: `“${p.headline}” does not say much. Something like “Final-year CSE student · Backend and data” tells a reader what to expect.`,
      href: "/dashboard/profile/basics",
    })
  } else {
    passed.push("Your headline says what you do")
  }

  // ------------------------------------------------------------------- about
  const aboutWords = words(p?.about)
  if (aboutWords === 0) {
    add({
      id: "about-missing",
      severity: "high",
      title: "Your About section is empty",
      detail:
        "This is the paragraph a recruiter reads before deciding whether to keep reading. 40–80 words in your own voice.",
      href: "/dashboard/profile/basics",
    })
  } else if (aboutWords < 25) {
    add({
      id: "about-short",
      severity: "medium",
      title: `Your About is only ${aboutWords} words`,
      detail:
        "Too short to say anything specific. Add what you work on, what you are good at, and what you are looking for.",
      href: "/dashboard/profile/basics",
    })
  } else if (aboutWords > 140) {
    add({
      id: "about-long",
      severity: "low",
      title: `Your About is ${aboutWords} words`,
      detail:
        "Long enough that most readers will skip it. 40–80 words usually lands better; the detail belongs in your experience and projects.",
      href: "/dashboard/profile/basics",
    })
  } else {
    passed.push("Your About is a readable length")
  }

  // --------------------------------------------------------------- experience
  const allBullets = data.experiences.flatMap((x) => x.bullets ?? [])
  const noNumber = allBullets.filter((b) => !HAS_NUMBER.test(b))
  const weak = allBullets.filter((b) =>
    WEAK_OPENERS.some((w) => b.trim().toLowerCase().startsWith(w)),
  )

  if (allBullets.length > 0 && noNumber.length / allBullets.length > 0.7) {
    add({
      id: "bullets-no-metrics",
      severity: "high",
      title: `${noNumber.length} of your ${allBullets.length} bullet points have no number in them`,
      detail:
        "Numbers are what make a claim land: how many, how much faster, how many people, what percentage. Add the real figure where you know it — and leave it out where you do not.",
      href: "/dashboard/profile/experience",
      count: noNumber.length,
    })
  } else if (allBullets.length > 0) {
    passed.push("Your bullet points include concrete figures")
  }

  if (weak.length > 0) {
    add({
      id: "bullets-weak-openers",
      severity: "medium",
      title: `${weak.length} bullet point${weak.length > 1 ? "s" : ""} describe${weak.length > 1 ? "" : "s"} a duty, not a result`,
      detail: `Phrases like “${weak[0].trim().split(" ").slice(0, 3).join(" ")}…” say what you were given. Start with what you did and finish with what changed.`,
      href: "/dashboard/profile/experience",
      count: weak.length,
    })
  }

  const emptyExperience = data.experiences.filter(
    (x) => (x.bullets?.length ?? 0) === 0 && !x.summary?.trim(),
  )
  if (emptyExperience.length > 0) {
    add({
      id: "experience-empty",
      severity: "medium",
      title: `${emptyExperience.length} job${emptyExperience.length > 1 ? "s have" : " has"} no description`,
      detail: `“${emptyExperience[0].role} at ${emptyExperience[0].company}” is a job title with nothing under it. Two or three lines is enough.`,
      href: "/dashboard/profile/experience",
      count: emptyExperience.length,
    })
  }

  const undatedExperience = data.experiences.filter((x) => !x.startDate)
  if (undatedExperience.length > 0) {
    add({
      id: "experience-undated",
      severity: "medium",
      title: `${undatedExperience.length} job${undatedExperience.length > 1 ? "s are" : " is"} missing a start date`,
      detail:
        "A gap with no dates reads as something being hidden, even when it is just an oversight. Month and year is enough.",
      href: "/dashboard/profile/experience",
      count: undatedExperience.length,
    })
  }

  // ----------------------------------------------------------------- projects
  const projectsNoSummary = data.projects.filter((x) => !x.summary?.trim())
  if (projectsNoSummary.length > 0) {
    add({
      id: "projects-no-summary",
      severity: "medium",
      title: `${projectsNoSummary.length} project${projectsNoSummary.length > 1 ? "s have" : " has"} no one-line summary`,
      detail:
        "The one-liner is what appears on your resume. Without it the project is just a title on the page.",
      href: "/dashboard/profile/projects",
      count: projectsNoSummary.length,
    })
  }

  const projectsNoOutcome = data.projects.filter((x) => !x.outcome?.trim())
  if (data.projects.length > 0 && projectsNoOutcome.length === data.projects.length) {
    add({
      id: "projects-no-outcome",
      severity: "low",
      title: "None of your projects say what came of them",
      detail:
        "Who used it, how many, what it changed, what you learned. Even “about 300 weekly users during the pilot” is far better than silence.",
      href: "/dashboard/profile/projects",
    })
  }

  // ------------------------------------------------------------------- skills
  const skillNames = data.skills.map((s) => s.name.trim().toLowerCase())
  const duplicates = skillNames.filter((n, i) => skillNames.indexOf(n) !== i)

  if (data.skills.length === 0) {
    add({
      id: "skills-none",
      severity: "high",
      title: "You have not listed any skills",
      detail:
        "Automated screening looks here first, and so does a human scanning for a keyword. List what you actually use.",
      href: "/dashboard/profile/skills",
    })
  } else if (data.skills.length < 5) {
    add({
      id: "skills-few",
      severity: "medium",
      title: `Only ${data.skills.length} skill${data.skills.length > 1 ? "s" : ""} listed`,
      detail: "Aim for 8–15, grouped so they can be scanned. Include tools, not just subjects.",
      href: "/dashboard/profile/skills",
    })
  } else if (data.skills.length > 30) {
    add({
      id: "skills-many",
      severity: "low",
      title: `${data.skills.length} skills is a lot`,
      detail:
        "A long undifferentiated list reads as padding. Keep the ones you would be comfortable being questioned on.",
      href: "/dashboard/profile/skills",
    })
  } else {
    passed.push("Your skills list is a sensible length")
  }

  if (duplicates.length > 0) {
    add({
      id: "skills-duplicate",
      severity: "low",
      title: "You have duplicate skills",
      detail: `“${duplicates[0]}” appears more than once.`,
      href: "/dashboard/profile/skills",
      count: duplicates.length,
    })
  }

  // ---------------------------------------------------------------- education
  const educationThin = data.educations.filter((e) => !e.degree?.trim() && !e.field?.trim())
  if (educationThin.length > 0) {
    add({
      id: "education-thin",
      severity: "low",
      title: "An education entry has no degree or subject",
      detail: `“${educationThin[0].institution}” is listed without saying what you studied there.`,
      href: "/dashboard/profile/education",
      count: educationThin.length,
    })
  }

  // ------------------------------------------------------------------ contact
  const anyLink = Object.values(links).some(Boolean)
  const reachable = contact.showEmail || contact.showPhone || anyLink
  const published = data.portfolio?.published

  if (published && !reachable) {
    add({
      id: "contact-unreachable",
      severity: "high",
      title: "Nobody can contact you",
      detail:
        "Your profile is public, but your email and phone are hidden and there are no links. Show at least one way to reach you.",
      href: "/dashboard/profile/basics",
    })
  } else if (!anyLink) {
    add({
      id: "links-none",
      severity: "low",
      title: "You have not added any links",
      detail:
        "A LinkedIn, GitHub, Behance or personal site gives a reader somewhere to go next. Add the ones that fit your field.",
      href: "/dashboard/profile/basics",
    })
  } else {
    passed.push("You can be contacted or looked up")
  }

  // ----------------------------------------------------------- bullet length
  const longBullets = allBullets.filter((b) => b.length > 240)
  if (longBullets.length > 0) {
    add({
      id: "bullets-long",
      severity: "low",
      title: `${longBullets.length} bullet point${longBullets.length > 1 ? "s are" : " is"} very long`,
      detail: "A bullet longer than two lines stops being a bullet. Split it, or cut it down.",
      href: "/dashboard/profile/experience",
      count: longBullets.length,
    })
  }

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 }
  findings.sort((a, b) => order[a.severity] - order[b.severity])

  const deduction = findings.reduce((sum, f) => sum + WEIGHT[f.severity], 0)

  return { score: Math.max(0, 100 - deduction), findings, passed }
}
