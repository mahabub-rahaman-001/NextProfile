import { describe, expect, it } from "vitest"
import {
  educationSchema,
  experienceSchema,
  docConfigSchema,
  profileSchema,
  usernameSchema,
  monthDate,
  urlish,
} from "@/lib/validation"

describe("validation", () => {
  it("requires an institution on education", () => {
    expect(educationSchema.safeParse({ institution: "" }).success).toBe(false)
    expect(educationSchema.safeParse({ institution: "Dhaka University" }).success).toBe(true)
  })

  it("parses month inputs, full dates and blanks", () => {
    expect(monthDate.parse("2024-06")?.getFullYear()).toBe(2024)
    expect(monthDate.parse("2024-06")?.getMonth()).toBe(5)
    expect(monthDate.parse("2024-06-15")?.getDate()).toBe(15)
    expect(monthDate.parse("")).toBeNull()
    expect(monthDate.parse(undefined)).toBeNull()
    expect(monthDate.parse("not a date")).toBeNull()
  })

  it("rejects a link without a scheme but allows an empty one", () => {
    expect(urlish.safeParse("github.com/me").success).toBe(false)
    expect(urlish.safeParse("https://github.com/me").success).toBe(true)
    expect(urlish.safeParse("").success).toBe(true)
  })

  it("keeps experience bullets bounded", () => {
    const ok = experienceSchema.safeParse({
      company: "Acme",
      role: "Analyst",
      bullets: ["Did a thing", "Did another thing"],
    })
    expect(ok.success).toBe(true)
    const tooMany = experienceSchema.safeParse({
      company: "Acme",
      role: "Analyst",
      bullets: Array(13).fill("x"),
    })
    expect(tooMany.success).toBe(false)
  })

  it("requires a real name on the profile", () => {
    expect(profileSchema.safeParse({ fullName: "A" }).success).toBe(false)
    expect(profileSchema.safeParse({ fullName: "Mahabub Rahaman" }).success).toBe(true)
  })

  it("applies document config defaults", () => {
    const cfg = docConfigSchema.parse({})
    expect(cfg.density).toBe("regular")
    expect(cfg.paper).toBe("A4")
    expect(cfg.accent).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(cfg.hidden).toEqual([])
  })

  it("rejects a malformed accent colour", () => {
    expect(docConfigSchema.safeParse({ accent: "green" }).success).toBe(false)
  })

  it("normalises and constrains usernames", () => {
    expect(usernameSchema.parse("  MahaBub  ")).toBe("mahabub")
    expect(usernameSchema.safeParse("ab").success).toBe(false)
    expect(usernameSchema.safeParse("-leading").success).toBe(false)
    expect(usernameSchema.safeParse("has space").success).toBe(false)
    expect(usernameSchema.safeParse("valid-name-9").success).toBe(true)
  })
})
