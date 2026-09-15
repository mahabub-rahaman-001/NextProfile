import { describe, expect, it } from "vitest"
import { THEMES, THEME_IDS, isThemeId } from "@/components/portfolio/themes"
import { TEMPLATES } from "@/components/resume/templates"
import { PROFILE_TYPE_LABELS } from "@/lib/types"

describe("portfolio themes", () => {
  it("ships ten themes", () => {
    expect(THEME_IDS).toHaveLength(10)
  })

  it("gives every theme a distinct component", () => {
    const components = Object.values(THEMES).map((t) => t.Component)
    expect(new Set(components).size).toBe(components.length)
  })

  it("gives every theme a name and a blurb that says what is different about it", () => {
    for (const t of Object.values(THEMES)) {
      expect(t.name.length).toBeGreaterThan(2)
      expect(t.blurb.length).toBeGreaterThan(25)
    }
  })

  it("uses a distinct blurb per theme", () => {
    const blurbs = Object.values(THEMES).map((t) => t.blurb)
    expect(new Set(blurbs).size).toBe(blurbs.length)
  })

  it("recommends at least one theme to every profile type", () => {
    for (const type of Object.keys(PROFILE_TYPE_LABELS)) {
      // The five core configurations are what `suits` is written against;
      // the rest fall back to the professional set at recommendation time.
      if (!["STUDENT", "PROFESSIONAL", "RESEARCHER", "FREELANCER", "CREATIVE"].includes(type)) continue
      const matches = Object.values(THEMES).filter((t) =>
        (t.suits as readonly string[]).includes(type),
      )
      expect(matches.length, `no theme suits ${type}`).toBeGreaterThan(0)
    }
  })

  it("validates theme ids", () => {
    expect(isThemeId("terminal")).toBe(true)
    expect(isThemeId("nonsense")).toBe(false)
  })
})

describe("resume templates", () => {
  it("keeps exactly one ATS-safe template", () => {
    const safe = Object.values(TEMPLATES).filter((t) => t.atsSafe)
    expect(safe).toHaveLength(1)
    expect(safe[0].id).toBe("minimal")
  })
})
