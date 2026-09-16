import { beforeEach, describe, expect, it, vi } from "vitest"

const findMany = vi.fn()

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findMany,
    },
  },
}))

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.DATABASE_URL
    process.env.NEXT_PUBLIC_APP_URL = "https://nextprofile.app"
  })

  it("returns only the base entry when DATABASE_URL is missing", async () => {
    const { default: sitemap } = await import("@/app/sitemap")

    const result = await sitemap()

    expect(findMany).not.toHaveBeenCalled()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ url: "https://nextprofile.app", priority: 1 })
  })

  it("includes public profile entries when DATABASE_URL exists", async () => {
    process.env.DATABASE_URL = "postgres://test"
    findMany.mockResolvedValueOnce([{ username: "mahabub", profile: { updatedAt: new Date("2026-01-01") } }])
    const { default: sitemap } = await import("@/app/sitemap")

    const result = await sitemap()

    expect(findMany).toHaveBeenCalledOnce()
    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({ url: "https://nextprofile.app/view/mahabub", priority: 0.8 })
  })
})
