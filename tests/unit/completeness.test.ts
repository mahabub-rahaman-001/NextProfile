import { describe, expect, it } from "vitest"
import { WEIGHTS, basicsRatio, computeCompleteness, fillRatio } from "@/lib/completeness"

const FULL_BASICS = {
  fullName: "Mahabub Rahaman",
  headline: "Final-year BBA student · Marketing analytics",
  about:
    "Final-year BBA student majoring in marketing, focused on campaign analytics and consumer research. " +
    "Comfortable turning spreadsheet data into clear recommendations, and looking for a marketing " +
    "internship where I can support live campaigns and learn from an experienced team.",
  photoUrl: "https://cdn.example.com/a.jpg",
  location: "Dhaka, Bangladesh",
  contactEmail: "me@example.com",
}

describe("completeness", () => {
  it("has weights summing to 100 for every core type", () => {
    for (const [type, weights] of Object.entries(WEIGHTS)) {
      const sum = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0)
      expect(sum, `${type} weights`).toBe(100)
    }
  })

  it("scores partial fills honestly", () => {
    expect(fillRatio(0)).toBe(0)
    expect(fillRatio(1)).toBe(0.6)
    expect(fillRatio(2)).toBe(0.85)
    expect(fillRatio(3)).toBe(1)
    expect(fillRatio(9)).toBe(1)
  })

  it("scores basics on substance, not presence", () => {
    expect(basicsRatio({})).toBe(0)
    expect(basicsRatio({ fullName: "A", headline: "hi", about: "short" })).toBeLessThan(0.4)
    expect(basicsRatio(FULL_BASICS)).toBe(1)
  })

  it("gives an empty profile a score of 0", () => {
    const r = computeCompleteness("STUDENT", {}, {})
    expect(r.score).toBe(0)
  })

  it("cannot reach 100% for a researcher without publications", () => {
    const r = computeCompleteness("RESEARCHER", FULL_BASICS, {
      education: 3,
      research: 3,
      experience: 3,
      conferences: 3,
      publications: 0,
    })
    expect(r.score).toBeLessThan(100)
    expect(r.score).toBe(75)
    expect(r.missing[0].key).toBe("publications")
  })

  it("reaches 100% when every weighted module is full", () => {
    const r = computeCompleteness("STUDENT", FULL_BASICS, {
      education: 3,
      skills: 5,
      projects: 3,
      experience: 3,
      achievements: 3,
      certifications: 3,
    })
    expect(r.score).toBe(100)
    expect(r.missing).toHaveLength(0)
  })

  it("names at most two missing items, highest value first", () => {
    const r = computeCompleteness("STUDENT", FULL_BASICS, { education: 3, skills: 3 })
    expect(r.missing).toHaveLength(2)
    expect(r.missing[0].key).toBe("projects") // weight 20
    expect(r.missing[0].gain).toBe(20)
    expect(r.missing[0].gain).toBeGreaterThanOrEqual(r.missing[1].gain)
  })

  it("weights the same data differently per profile type", () => {
    const counts = { experience: 3, education: 3, skills: 3 }
    const student = computeCompleteness("STUDENT", FULL_BASICS, counts).score
    const professional = computeCompleteness("PROFESSIONAL", FULL_BASICS, counts).score
    expect(professional).toBeGreaterThan(student)
  })
})
