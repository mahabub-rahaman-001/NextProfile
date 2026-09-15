import { describe, expect, it } from "vitest"
import {
  extractJobTerms,
  matchProfileToJob,
  profileTerms,
  stem,
  tokenise,
} from "@/lib/matching"
import type { ProfileData } from "@/lib/profile/load"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fixture = (over: any = {}): ProfileData =>
  ({
    profile: { headline: "Backend engineer", about: "I build APIs and data pipelines.", ...over.profile },
    skills: over.skills ?? [
      { name: "TypeScript", category: "Languages" },
      { name: "PostgreSQL", category: "Databases" },
      { name: "Node.js", category: "Frameworks" },
      { name: "Docker", category: "Tools" },
    ],
    projects: over.projects ?? [
      {
        title: "Campus Event Manager",
        tags: ["Next.js", "PostgreSQL", "Prisma"],
        summary: "Event registration system",
        outcome: "Used for 40 events",
        description: "",
      },
    ],
    experiences: over.experiences ?? [
      { role: "Backend Intern", summary: "Order management team", bullets: ["Built the inventory endpoint"] },
    ],
    educations: over.educations ?? [{ degree: "BSc", field: "Computer Science" }],
    certifications: over.certifications ?? [],
  }) as unknown as ProfileData

const BACKEND_JD = `
Backend Engineer

Responsibilities:
- Design and build REST APIs in Node.js and TypeScript
- Work with PostgreSQL databases and write efficient queries
- Containerise services with Docker

Requirements:
- Strong TypeScript experience
- Experience with PostgreSQL
- Familiarity with Docker and CI pipelines
`

const MARKETING_JD = `
Brand Marketing Manager

Responsibilities:
- Own the campaign calendar across paid social and influencer channels
- Run consumer research and segmentation studies
- Manage agency relationships and media budgets

Requirements:
- Campaign management experience
- Comfortable with media planning and brand strategy
`

describe("tokenise and stem", () => {
  it("keeps technical tokens intact", () => {
    const t = tokenise("We use Node.js, C++ and C# with .NET")
    expect(t).toContain("node.js")
    expect(t).toContain("c++")
    expect(t).toContain("c#")
  })

  it("strips trailing punctuation", () => {
    expect(tokenise("PostgreSQL, Docker.")).toEqual(["postgresql", "docker"])
  })

  it("stems common suffixes predictably", () => {
    expect(stem("designing")).toBe("design")
    expect(stem("databases")).toBe("database")
    expect(stem("managed")).toBe("manag")
    expect(stem("api")).toBe("api") // short words left alone
    expect(stem("apis")).toBe("api")
  })
})

describe("extractJobTerms", () => {
  it("drops boilerplate that appears in every ad", () => {
    const terms = extractJobTerms(BACKEND_JD).map((t) => t.term)
    expect(terms).not.toContain("responsibilities")
    expect(terms).not.toContain("experience")
    expect(terms).not.toContain("strong")
  })

  it("keeps the technical terms", () => {
    const terms = extractJobTerms(BACKEND_JD).map((t) => t.term)
    expect(terms).toContain("typescript")
    expect(terms).toContain("postgresql")
    expect(terms).toContain("docker")
  })

  it("weights bullet lines above prose", () => {
    const terms = extractJobTerms(BACKEND_JD)
    const docker = terms.find((t) => t.term === "docker")
    expect(docker!.weight).toBeGreaterThan(1)
  })

  it("returns nothing for an empty ad", () => {
    expect(extractJobTerms("")).toEqual([])
  })
})

describe("matchProfileToJob", () => {
  it("scores a relevant job highly", () => {
    const r = matchProfileToJob(fixture(), BACKEND_JD)
    expect(r.score).toBeGreaterThan(45)
    expect(r.matched.map((m) => m.term)).toEqual(
      expect.arrayContaining(["typescript", "postgresql", "docker"]),
    )
  })

  it("scores an unrelated job low", () => {
    const r = matchProfileToJob(fixture(), MARKETING_JD)
    expect(r.score).toBeLessThan(25)
  })

  it("ranks the relevant job above the unrelated one", () => {
    const backend = matchProfileToJob(fixture(), BACKEND_JD).score
    const marketing = matchProfileToJob(fixture(), MARKETING_JD).score
    expect(backend).toBeGreaterThan(marketing + 20)
  })

  it("says where each match came from", () => {
    const r = matchProfileToJob(fixture(), BACKEND_JD)
    const ts = r.matched.find((m) => m.term === "typescript")
    expect(ts?.where).toBe("your skills")
  })

  it("surfaces missing terms and never invents advice", () => {
    const r = matchProfileToJob(fixture({ skills: [{ name: "TypeScript" }] }), BACKEND_JD)
    expect(r.missing.length).toBeGreaterThan(0)
    expect(r.suggestions.join(" ")).toContain("Never add a skill you do not have")
  })

  it("keeps the score inside 0–100 and always carries the disclaimer", () => {
    for (const jd of [BACKEND_JD, MARKETING_JD, "", "the and of"]) {
      const r = matchProfileToJob(fixture(), jd)
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(100)
      expect(r.disclaimer).toMatch(/not a prediction/)
    }
  })

  it("weights a skill higher than the same word buried in prose", () => {
    const inSkills = matchProfileToJob(fixture(), "Docker")
    const inProse = matchProfileToJob(
      fixture({ skills: [], projects: [], experiences: [], profile: { about: "I once used Docker." } }),
      "Docker",
    )
    expect(inSkills.score).toBeGreaterThan(inProse.score)
  })
})

describe("profileTerms", () => {
  it("collects terms from every part of the profile", () => {
    const terms = profileTerms(fixture())
    expect(terms.has("typescript")).toBe(true)
    expect(terms.has("prisma")).toBe(true) // project tag
    expect(terms.get("typescript")!.where).toBe("your skills")
  })
})
