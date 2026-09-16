import { afterEach, describe, expect, it, vi } from "vitest"

const findMany = vi.fn()

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findMany,
    },
  },
}))

describe("sitemap", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  afterEach(() => {
    vi.resetModules()
    findMany.mockReset()
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = originalDatabaseUrl
  })

  it("returns only the home URL when DATABASE_URL is not set", async () => {
    delete process.env.DATABASE_URL

    const { default: sitemap } = await import("@/app/sitemap")
    const result = await sitemap()

    expect(findMany).not.toHaveBeenCalled()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      url: "http://localhost:3000",
      priority: 1,
    })
  })
})
