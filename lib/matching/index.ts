import type { ProfileData } from "@/lib/profile/load"

/**
 * Job matching — deterministic, no model call.
 *
 * The score measures ONE thing: how much of the language in the posted job
 * description already appears in the user's profile. It is not a prediction,
 * and the UI must never present it as one. Being explicit about that is what
 * makes the number honest enough to show.
 *
 * Why no AI here: keyword overlap is what automated screening actually does,
 * it costs nothing per run, it is reproducible, and it can be unit-tested.
 * The AI layer can add judgement on top later — it does not need to do this.
 */

export type MatchTerm = { term: string; weight: number; where?: string }

export type MatchResult = {
  score: number
  matched: MatchTerm[]
  missing: MatchTerm[]
  suggestions: string[]
  disclaimer: string
}

export const MATCH_DISCLAIMER =
  "This score reflects how much of the job ad's own language already appears in your profile. It is not a prediction of whether you will be interviewed."

const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","than","that","this","these","those","of","in","on",
  "at","to","for","with","without","from","by","as","is","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","can","could","should","may","might","must",
  "we","you","your","our","us","they","them","their","he","she","it","its","i","me","my",
  "not","no","yes","all","any","some","more","most","other","such","own","same","so","too","very",
  "up","down","out","off","over","under","again","further","once","here","there","when","where",
  "why","how","what","which","who","whom","while","about","against","between","into","through",
  // job-ad boilerplate: present in every ad, therefore meaningless as a signal
  "job","role","position","candidate","applicant","apply","application","responsibilities",
  "requirements","required","qualifications","preferred","must","desirable","essential","looking",
  "seeking","join","team","company","organisation","organization","work","working","works",
  "experience","experienced","year","years","skills","skill","ability","able","strong","excellent",
  "good","great","solid","proven","demonstrated","knowledge","understanding","familiar",
  "familiarity","plus","bonus","etc","including","include","includes","well","best","new","using",
  "use","used","ensure","ensuring","support","supporting","help","helping","across","within",
  "day","daily","week","weekly","month","monthly","time","full","part","remote","onsite","office",
  "salary","benefits","opportunity","opportunities","environment","culture","please","send","cv",
  "resume","email","contact","description","summary","overview","key","various","related","etc.",
])

/** Keeps c++, c#, node.js, .net intact; splits everything else on non-word characters. */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .split(/[^a-z0-9+#.\-']+/)
    .map((t) => t.replace(/^[.\-']+|[.\-']+$/g, ""))
    .filter((t) => t.length > 1 && t.length < 30)
}

/**
 * Crude but predictable stemming — enough to match "designing" to "design"
 * and "APIs" to "API". Both sides of a comparison go through it, so the rules
 * only have to be consistent, not linguistically perfect.
 */
export function stem(word: string): string {
  if (word.length <= 3) return word
  let w = word

  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3)
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2)
  else if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`
  else if (w.length > 4 && /(ch|sh|x|z)es$/.test(w)) w = w.slice(0, -2)
  else if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) w = w.slice(0, -1)

  return w
}

function isMeaningful(token: string): boolean {
  if (STOPWORDS.has(token)) return false
  if (/^\d+$/.test(token)) return false
  return true
}

/**
 * Terms the job ad actually emphasises. A term inside a bullet line counts for
 * more, because that is where requirements live.
 */
export function extractJobTerms(jobDescription: string, limit = 40): MatchTerm[] {
  const lines = jobDescription.split(/\r?\n/)
  const weights = new Map<string, number>()

  const bump = (term: string, by: number) => {
    if (!isMeaningful(term)) return
    weights.set(term, (weights.get(term) ?? 0) + by)
  }

  for (const line of lines) {
    const bulletish = /^\s*([-*•·–]|\d+[.)])\s+/.test(line)
    const base = bulletish ? 1.6 : 1
    const tokens = tokenise(line)

    for (let i = 0; i < tokens.length; i++) {
      bump(tokens[i], base)
      // Two-word phrases carry most technical meaning: "machine learning",
      // "google analytics", "campaign management".
      if (i + 1 < tokens.length) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`
        if (isMeaningful(tokens[i]) && isMeaningful(tokens[i + 1])) {
          bump(bigram, base * 1.4)
        }
      }
    }
  }

  // A bigram makes its parts redundant when it is at least as strong.
  for (const [term, weight] of [...weights.entries()]) {
    if (!term.includes(" ")) continue
    for (const part of term.split(" ")) {
      const partWeight = weights.get(part)
      if (partWeight !== undefined && partWeight <= weight * 1.2) weights.delete(part)
    }
  }

  return [...weights.entries()]
    .map(([term, weight]) => ({ term, weight: Math.round(weight * 100) / 100 }))
    .sort((a, b) => b.weight - a.weight || a.term.localeCompare(b.term))
    .slice(0, limit)
}

/** Everything the profile says, with the weight of where it was said. */
export function profileTerms(data: ProfileData): Map<string, { weight: number; where: string }> {
  const terms = new Map<string, { weight: number; where: string }>()

  const add = (text: string | null | undefined, weight: number, where: string) => {
    if (!text) return
    const tokens = tokenise(text)
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i]
      if (!isMeaningful(t)) continue
      const existing = terms.get(stem(t))
      if (!existing || existing.weight < weight) terms.set(stem(t), { weight, where })
      if (i + 1 < tokens.length && isMeaningful(tokens[i + 1])) {
        const bigram = `${stem(t)} ${stem(tokens[i + 1])}`
        const ex = terms.get(bigram)
        if (!ex || ex.weight < weight) terms.set(bigram, { weight, where })
      }
    }
  }

  for (const s of data.skills) add(s.name, 3, "your skills")
  for (const c of data.certifications) add(c.name, 2, "your certifications")
  add(data.profile?.headline, 2, "your headline")
  for (const p of data.projects) {
    add(p.title, 2, "a project")
    add(p.tags.join(" "), 2.5, "a project's tools")
    add(p.summary, 1.5, "a project")
    add(p.outcome, 1.5, "a project")
    add(p.description, 1, "a project")
  }
  for (const x of data.experiences) {
    add(x.role, 2, "a job title")
    add(x.summary, 1.2, "your experience")
    add(x.bullets.join(" "), 1.2, "your experience")
  }
  for (const e of data.educations) add([e.degree, e.field].filter(Boolean).join(" "), 1, "your education")
  add(data.profile?.about, 1, "your about")

  return terms
}

export function matchProfileToJob(data: ProfileData, jobDescription: string): MatchResult {
  const jobTerms = extractJobTerms(jobDescription)
  if (jobTerms.length === 0) {
    return {
      score: 0,
      matched: [],
      missing: [],
      suggestions: ["Paste the job description and we'll compare it with your profile."],
      disclaimer: MATCH_DISCLAIMER,
    }
  }

  const mine = profileTerms(data)
  const matched: MatchTerm[] = []
  const missing: MatchTerm[] = []

  let earned = 0
  let available = 0

  for (const jt of jobTerms) {
    const parts = jt.term.split(" ").map(stem)
    const key = parts.join(" ")
    const hit = mine.get(key)
    available += jt.weight

    if (hit) {
      // Saying it in your skills counts for more than saying it in prose.
      earned += jt.weight * Math.min(1, 0.55 + hit.weight * 0.15)
      matched.push({ ...jt, where: hit.where })
      continue
    }

    // "rest apis" should not score zero for a profile that says "APIs".
    // Half credit for a phrase you have partly covered.
    const partial = parts.map((p) => mine.get(p)).find(Boolean)
    if (parts.length > 1 && partial) {
      earned += jt.weight * 0.5 * Math.min(1, 0.55 + partial.weight * 0.15)
      matched.push({ ...jt, where: `${partial.where} (partly)` })
      continue
    }

    missing.push(jt)
  }

  const score = Math.max(0, Math.min(100, Math.round((earned / available) * 100)))

  return {
    score,
    matched: matched.slice(0, 20),
    missing: missing.slice(0, 12),
    suggestions: buildSuggestions(missing, score),
    disclaimer: MATCH_DISCLAIMER,
  }
}

function buildSuggestions(missing: MatchTerm[], score: number): string[] {
  const out: string[] = []
  const top = missing.slice(0, 4)

  for (const m of top) {
    out.push(
      `The ad asks for “${m.term}”. If you have done it, add it to your skills or name it in a project — in their words, not yours.`,
    )
  }

  if (score < 40) {
    out.push(
      "Fewer than half the ad's terms appear in your profile. Before tailoring the wording, check this role is really the one you want to apply for.",
    )
  } else if (score < 70) {
    out.push(
      "A tailored copy of your resume, with the matching experience moved to the top, would read much closer to this ad.",
    )
  } else {
    out.push(
      "Your profile already uses most of this ad's language. Move the matching experience to the top and you are ready to send.",
    )
  }

  out.push("Never add a skill you do not have. An interview finds it out immediately.")
  return out
}
