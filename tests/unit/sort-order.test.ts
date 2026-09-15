import { describe, expect, it } from "vitest"
import { SORT_GAP, midpoint, needsRenormalise, renormalise } from "@/lib/sort-order"

describe("sortOrder", () => {
  it("appends after the last item", () => {
    expect(midpoint(3000, null)).toBe(4000)
  })

  it("prepends before the first item", () => {
    expect(midpoint(null, 1000)).toBe(0)
  })

  it("returns the gap for an empty list", () => {
    expect(midpoint(null, null)).toBe(SORT_GAP)
  })

  it("lands exactly between two neighbours", () => {
    expect(midpoint(1000, 2000)).toBe(1500)
    expect(midpoint(1000, 1001)).toBe(1000.5)
  })

  it("flags a list whose gaps have collapsed", () => {
    expect(needsRenormalise([1, 2, 3])).toBe(false)
    expect(needsRenormalise([1, 1.0001, 2])).toBe(true)
  })

  it("renormalises to even gaps", () => {
    expect(renormalise(3)).toEqual([1000, 2000, 3000])
  })

  it("survives 60 drops into the same slot after renormalising", () => {
    let a = 1000
    const b = 2000
    for (let i = 0; i < 60; i++) a = midpoint(a, b)
    expect(Number.isFinite(a)).toBe(true)
    expect(needsRenormalise([a, b])).toBe(true) // and the job would fire
  })
})
