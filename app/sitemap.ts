import type { MetadataRoute } from "next"
import { db } from "@/lib/db"

/**
 * Regenerated hourly. Without this Next runs the query once during `next build`
 * and every profile published afterwards is missing until the next deploy.
 */
export const revalidate = 3600

/** Public profiles only — never unlisted, never private. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const users = await db.user.findMany({
    where: {
      username: { not: null },
      suspendedAt: null,
      portfolio: { published: true },
      profile: { visibility: "PUBLIC" },
    },
    select: { username: true, profile: { select: { updatedAt: true } } },
    take: 5000,
  })

  return [
    { url: base, lastModified: new Date(), priority: 1 },
    ...users.map((u) => ({
      url: `${base}/view/${u.username}`,
      lastModified: u.profile?.updatedAt ?? new Date(),
      priority: 0.8,
    })),
  ]
}
