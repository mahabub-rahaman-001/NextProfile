import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { absoluteUrl, initials } from "@/lib/utils"

/**
 * A small card meant to be dropped into a blog or a GitHub README in an
 * iframe. Every embed is a backlink and a first impression of the product.
 */
export const revalidate = 3600

export const metadata: Metadata = { robots: { index: false, follow: true } }

export default async function EmbedPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const user = await db.user.findUnique({
    where: { username },
    include: {
      profile: true,
      portfolio: { select: { published: true } },
      skills: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, take: 6 },
    },
  })

  if (
    !user?.profile ||
    !user.portfolio?.published ||
    user.profile.visibility === "PRIVATE" ||
    user.suspendedAt
  ) {
    notFound()
  }

  const p = user.profile
  const url = absoluteUrl(`/view/${username}`)

  return (
    <div className="p-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-md border border-[--line] bg-[--surface] p-4 no-underline"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[--accent-soft] text-sm font-semibold text-[--accent]">
            {initials(p.fullName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{p.fullName}</span>
            {p.headline ? (
              <span className="block truncate text-sm text-ink-soft">{p.headline}</span>
            ) : null}
          </span>
        </div>

        {user.skills.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {user.skills.map((s) => (
              <li
                key={s.id}
                className="rounded-sm border border-[--line] px-1.5 py-0.5 text-xs text-ink-soft"
              >
                {s.name}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[--accent]">View full profile →</span>
          <span className="text-ink-faint">NextProfile</span>
        </p>
      </a>
    </div>
  )
}
