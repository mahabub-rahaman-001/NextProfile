import { describe, expect, it } from "vitest"
import { reviewProfile } from "@/lib/review"
import type { ProfileData } from "@/lib/profile/load"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const make = (over: any = {}): ProfileData =>
  ({
    profile: {
      headline: "Backend engineer · APIs and data",
      about:
        "Backend engineer with four years building APIs and data pipelines for e-commerce teams. " +
        "I like the part of the job where a slow query becomes a fast one, and I care about the tests.",
      contact: { showEmail: true, email: "me@example.com" },
      links: { linkedin: "https://linkedin.com/in/example" },
      ...over.profile,
    },
    portfolio: over.portfolio ?? { published: false },
    experiences: over.experiences ?? [
      {
        role: "Backend Engineer",
        company: "Acme",
        startDate: new Date("2022-01-01"),
        summary: "Order platform team",
        bullets: ["Cut a nightly job from 40 minutes to 9 by batching writes"],
      },
    ],
    projects: over.projects ?? [
      { title: "Event Manager", summary: "Registration system", outcome: "40 events in a term" },
    ],
    skills:
      over.skills ??
      ["TypeScript", "PostgreSQL", "Node.js", "Docker", "Redis", "Prisma"].map((name) => ({ name })),
    educations: over.educations ?? [{ institution: "BUET", degree: "BSc", field: "CSE" }],
    certifications: [],
  }) as unknown as ProfileData

describe("profile review", () => {
  it("gives a well-filled profile a high score and few findings", () => {
    const r = reviewProfile(make())
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.findings.filter((f) => f.severity === "high")).toHaveLength(0)
    expect(r.passed.length).toBeGreaterThan(2)
  })

  it("flags a missing headline as high severity", () => {
    const r = reviewProfile(make({ profile: { headline: "" } }))
    expect(r.findings.find((f) => f.id === "headline-missing")?.severity).toBe("high")
  })

  it("counts bullets that have no numbers in them", () => {
    const r = reviewProfile(
      make({
        experiences: [
          {
            role: "Intern",
            company: "Acme",
            startDate: new Date(),
            bullets: ["Built the dashboard", "Improved the sync job", "Wrote documentation"],
          },
        ],
      }),
    )
    const f = r.findings.find((x) => x.id === "bullets-no-metrics")
    expect(f).toBeDefined()
    expect(f!.count).toBe(3)
    expect(f!.title).toContain("3 of your 3")
  })

  it("catches duty-style openers and quotes the offending phrase", () => {
    const r = reviewProfile(
      make({
        experiences: [
          {
            role: "Analyst",
            company: "Acme",
            startDate: new Date(),
            bullets: ["Responsible for the weekly report", "Cut costs by 12%"],
          },
        ],
      }),
    )
    const f = r.findings.find((x) => x.id === "bullets-weak-openers")
    expect(f?.count).toBe(1)
    expect(f?.detail).toContain("Responsible for the")
  })

  it("warns when a published profile has no way to contact the person", () => {
    const r = reviewProfile(
      make({
        portfolio: { published: true },
        profile: { contact: { showEmail: false, showPhone: false }, links: {} },
      }),
    )
    const f = r.findings.find((x) => x.id === "contact-unreachable")
    expect(f?.severity).toBe("high")
  })

  it("does not raise the contact alarm while the profile is still private", () => {
    const r = reviewProfile(
      make({
        portfolio: { published: false },
        profile: { contact: { showEmail: false, showPhone: false }, links: {} },
      }),
    )
    expect(r.findings.find((x) => x.id === "contact-unreachable")).toBeUndefined()
  })

  it("flags undated jobs", () => {
    const r = reviewProfile(
      make({ experiences: [{ role: "Intern", company: "Acme", bullets: ["Did 3 things"] }] }),
    )
    expect(r.findings.find((x) => x.id === "experience-undated")).toBeDefined()
  })

  it("notices duplicate and thin skill lists", () => {
    const dup = reviewProfile(
      make({ skills: [{ name: "Excel" }, { name: "excel" }, { name: "SQL" }] }),
    )
    expect(dup.findings.find((f) => f.id === "skills-duplicate")).toBeDefined()
    expect(dup.findings.find((f) => f.id === "skills-few")).toBeDefined()
  })

  it("sorts findings with the most serious first", () => {
    const r = reviewProfile(make({ profile: { headline: "", about: "" }, skills: [] }))
    const order = r.findings.map((f) => f.severity)
    expect(order).toEqual([...order].sort((a, b) => rank(a) - rank(b)))
    expect(order[0]).toBe("high")
  })

  it("keeps the score inside 0–100 for an empty profile", () => {
    const empty = reviewProfile(
      make({
        profile: { headline: "", about: "", contact: {}, links: {} },
        experiences: [],
        projects: [],
        skills: [],
        educations: [],
      }),
    )
    expect(empty.score).toBeGreaterThanOrEqual(0)
    expect(empty.score).toBeLessThanOrEqual(100)
  })

  it("gives every finding a link to the screen that fixes it", () => {
    const r = reviewProfile(make({ profile: { headline: "" }, skills: [] }))
    for (const f of r.findings) {
      expect(f.href).toMatch(/^\/dashboard\//)
      expect(f.detail.length).toBeGreaterThan(20)
    }
  })
})

function rank(s: string) {
  return { high: 0, medium: 1, low: 2 }[s as "high" | "medium" | "low"]
}
