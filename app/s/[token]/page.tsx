import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { loadFullProfile } from "@/lib/profile/load"
import { docConfigSchema, portfolioConfigSchema } from "@/lib/validation"
import { DocumentRenderer } from "@/components/resume/templates"
import { PortfolioRenderer } from "@/components/portfolio/themes"

/**
 * A private share link. Unlisted, expiring, revocable — and never indexed.
 * The owner can see how often it was opened (a count, not an identity).
 */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const link = await db.shareLink.findUnique({
    where: { token },
    include: { document: true },
  })

  if (!link) notFound()
  if (link.revokedAt) return <Gone reason="This link was turned off by its owner." />
  if (link.expiresAt && link.expiresAt < new Date())
    return <Gone reason="This link has expired." />

  await db.shareLink.update({
    where: { id: link.id },
    data: { views: { increment: 1 }, lastViewAt: new Date() },
  })

  const data = await loadFullProfile(link.userId)
  if (!data?.profile) notFound()

  if (link.document) {
    const config = docConfigSchema.parse(link.document.config ?? {})
    return (
      <main className="min-h-screen bg-[--surface-2] py-8">
        <Banner label={link.label} expiresAt={link.expiresAt} />
        <div className="flex justify-center px-2">
          <div className="max-w-full overflow-x-auto shadow-sm">
            <DocumentRenderer
              data={data}
              kind={link.document.kind}
              templateId={link.document.templateId}
              config={config}
            />
          </div>
        </div>
      </main>
    )
  }

  const config = portfolioConfigSchema.parse(data.portfolio?.config ?? {})
  return (
    <>
      <Banner label={link.label} expiresAt={link.expiresAt} />
      <PortfolioRenderer data={data} themeId={data.portfolio?.themeId ?? "minimal"} config={config} />
    </>
  )
}

function Banner({ label, expiresAt }: { label: string | null; expiresAt: Date | null }) {
  return (
    <div className="border-b border-[--line] bg-[--surface] px-5 py-2 text-center text-xs text-ink-faint">
      Private link{label ? ` · ${label}` : ""}
      {expiresAt ? ` · expires ${expiresAt.toLocaleDateString()}` : ""}
    </div>
  )
}

function Gone({ reason }: { reason: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 text-center">
      <h1 className="text-2xl font-semibold">This link is no longer available</h1>
      <p className="mt-2 text-ink-soft">{reason}</p>
      <p className="mt-6 text-sm text-ink-faint">
        If you were sent this by someone, ask them for a new link.
      </p>
    </main>
  )
}
