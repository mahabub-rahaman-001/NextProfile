import { describe, expect, it } from "vitest"
import { MATRIX, getModules, getRecommendations, normaliseType } from "@/lib/modules"
import { MODULE_KEYS } from "@/lib/types"

describe("module visibility", () => {
  it("covers every module key for every core type", () => {
    for (const [type, row] of Object.entries(MATRIX)) {
      for (const key of MODULE_KEYS) {
        expect(row[key], `${type}.${key}`).toBeDefined()
      }
    }
  })

  it("maps the nine onboarding choices onto five configurations", () => {
    expect(normaliseType("STUDENT")).toBe("STUDENT")
    expect(normaliseType("JOB_SEEKER")).toBe("PROFESSIONAL")
    expect(normaliseType("TEACHER")).toBe("PROFESSIONAL")
    expect(normaliseType("ENTREPRENEUR")).toBe("PROFESSIONAL")
    expect(normaliseType("OTHER")).toBe("PROFESSIONAL")
    expect(normaliseType("RESEARCHER")).toBe("RESEARCHER")
    expect(normaliseType("FREELANCER")).toBe("FREELANCER")
    expect(normaliseType("CREATIVE")).toBe("CREATIVE")
  })

  it("shows a researcher publications and research by default", () => {
    const m = getModules("RESEARCHER")
    expect(m.visible).toContain("publications")
    expect(m.visible).toContain("research")
    expect(m.visible).toContain("conferences")
  })

  it("does not offer a student services or testimonials up front", () => {
    const m = getModules("STUDENT")
    expect(m.visible).not.toContain("services")
    expect(m.hidden).toContain("services")
    expect(m.hidden).toContain("testimonials")
  })

  it("shows a freelancer services, case studies and testimonials", () => {
    const m = getModules("FREELANCER")
    expect(m.visible).toEqual(expect.arrayContaining(["services", "caseStudies", "testimonials"]))
  })

  it("never hides a module that already has data", () => {
    const m = getModules("STUDENT", null, ["services", "testimonials"])
    expect(m.visible).toContain("services")
    expect(m.visible).toContain("testimonials")
    expect(m.hidden).not.toContain("services")
  })

  it("partitions every key exactly once", () => {
    const m = getModules("PROFESSIONAL")
    const all = [...m.visible, ...m.available, ...m.hidden]
    expect(all.sort()).toEqual([...MODULE_KEYS].sort())
    expect(new Set(all).size).toBe(MODULE_KEYS.length)
  })

  it("narrows link hints by discipline", () => {
    expect(getModules("STUDENT", "cse").hints.links).toContain("github")
    expect(getModules("CREATIVE", "design").hints.links).toContain("behance")
    expect(getModules("RESEARCHER", "research").hints.links).toContain("scholar")
    expect(getModules("PROFESSIONAL", "unknown-field").hints.links).toContain("linkedin")
  })

  it("recommends a CV to researchers and a modern template to creatives", () => {
    expect(getRecommendations("RESEARCHER").docKind).toBe("CV")
    expect(getRecommendations("CREATIVE").templateId).toBe("modern")
    expect(getRecommendations("PROFESSIONAL").templateId).toBe("professional")
  })
})
