import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { loadPublicProfile } from "@/lib/profile/load"
import { portfolioConfigSchema } from "@/lib/validation"
import { PortfolioRenderer } from "@/components/portfolio/themes"
import { ViewBeacon } from "@/components/portfolio/view-beacon"
import { ProfileFooter } from "@/components/portfolio/profile-footer"

/**
 * The public profile. Statically rendered and revalidated on publish and on
 * profile edits, so a profile that gets shared widely costs nothing to serve.
 */
export const revalidate = 3600

async function load(username: string) {
  const data = await loadPublicProfile(username)
  if (!data?.profile) return null
  if (data.suspendedAt) return null
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const data = await load(username)
  if (!data) return { title: "Profile not found" }

  const p = data.profile!
  const seo = (p.seo ?? {}) as { metaTitle?: string; metaDescription?: string; allowIndexing?: boolean }
  const title = seo.metaTitle || `${p.fullName}${p.headline ? ` — ${p.headline}` : ""}`
  const description =
    seo.metaDescription ||
    (p.about ? `${p.about.slice(0, 155)}…` : `The professional profile of ${p.fullName}.`)

  const indexable =
    seo.allowIndexing !== false &&
    data.profile!.visibility === "PUBLIC" &&
    !!data.portfolio?.published

  return {
    title,
    description,
    alternates: { canonical: `/view/${username}` },
    robots: indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/view/${username}`,
    },
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await load(username)

  // No user with this username at all
  if (!data) notFound()

  // Profile exists but not published or private — show friendly message
  if (!data.portfolio?.published || data.profile!.visibility === "PRIVATE") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f1f3ee] px-4 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="text-2xl font-semibold text-[#151a18]">
          {data.profile!.fullName
            ? `${data.profile!.fullName}'s profile`
            : `@${username}`}
        </h1>
        <p className="max-w-sm text-[#4e5a54]">
          This profile hasn&apos;t been published yet. Check back later!
        </p>
        <Link
          href="/"
          className="mt-2 rounded-md bg-[#0e5c4a] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Go to NextProfile
        </Link>
      </div>
    )
  }

  const config = portfolioConfigSchema.parse(data.portfolio?.config ?? {})

  return (
    <>
      <PortfolioRenderer data={data} themeId={data.portfolio!.themeId} config={config} />
      <ProfileFooter
        username={username}
        updatedAt={(data.profile!.updatedAt ?? new Date()).toISOString()}
      />
      <ViewBeacon username={username} />
    </>
  )
}
