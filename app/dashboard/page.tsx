import Link from "next/link"
import { ArrowUpRight, Briefcase, FileText, Globe, Stethoscope, Users } from "lucide-react"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { readCompleteness } from "@/lib/completeness/recompute"
import { comparePeers } from "@/lib/peers"
import { CompletenessCard } from "@/components/dashboard/completeness-card"
import { Card, Badge } from "@/components/ui/card"
import { Section } from "@/components/dashboard/page-header"

function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default async function OverviewPage() {
  const user = await requirePage()
  const [profile, portfolio, documents, result] = await Promise.all([
    db.profile.findUnique({ where: { userId: user.id } }),
    db.portfolio.findUnique({ where: { userId: user.id } }),
    db.document.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
    readCompleteness(user.id),
  ])

  const firstName = (profile?.fullName ?? "").split(" ")[0]
  const published = portfolio?.published && user.username

  const [peers, openApplications] = await Promise.all([
    profile ? comparePeers(user.id, profile.profileType, result.score) : null,
    db.application.count({
      where: { userId: user.id, deletedAt: null, status: { in: ["SAVED", "APPLIED", "INTERVIEW"] } },
    }),
  ])

  return (
    <>
      <header className="px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-semibold">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {result.score < 40
            ? "Let's get enough in place to build your first resume."
            : result.missing.length
              ? `Your profile is ${result.score}% complete.`
              : "Your profile is complete. Time to share it."}
        </p>
      </header>

      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CompletenessCard result={result} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <QuickAction
              href={documents[0] ? `/dashboard/resume/${documents[0].id}` : "/dashboard/resume"}
              icon={FileText}
              title={documents[0] ? documents[0].name : "Create a resume"}
              body={
                documents[0]
                  ? `${documents[0].templateId} template · updated ${documents[0].updatedAt.toLocaleDateString()}`
                  : "Three templates, one built to survive automated screening."
              }
            />
            <QuickAction
              href="/dashboard/portfolio"
              icon={Globe}
              title={published ? "Your portfolio" : "Build your portfolio"}
              body={
                published
                  ? `Published at /view/${user.username}`
                  : "Pick a theme, choose your sections, publish when you're ready."
              }
              badge={published ? <Badge tone="accent">Published</Badge> : <Badge>Private</Badge>}
            />
            <QuickAction
              href="/dashboard/applications"
              icon={Briefcase}
              title={
                openApplications
                  ? `${openApplications} open application${openApplications === 1 ? "" : "s"}`
                  : "Track an application"
              }
              body="Paste a job ad to see how much of its language your profile already uses."
            />
            <QuickAction
              href="/dashboard/review"
              icon={Stethoscope}
              title="Review my profile"
              body="What a recruiter notices in the first ten seconds — specific, checkable points."
            />
          </div>
        </div>

        {peers ? (
          <Card className="mt-4 flex flex-wrap items-center gap-3">
            <Users size={18} className="text-[--accent]" aria-hidden />
            <p className="text-sm">
              Your profile is more complete than{" "}
              <strong className="font-semibold" data-tabular>
                {peers.percentile}%
              </strong>{" "}
              of the {peers.cohortSize} other {peers.cohortLabel}s here.{" "}
              <span className="text-ink-faint">Their median is {peers.median}%.</span>
            </p>
          </Card>
        ) : null}

        {published ? (
          <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-ink-soft">Your public profile</p>
              <p className="font-medium">/view/{user.username}</p>
            </div>
            <Link
              href={`/view/${user.username}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-medium text-[--accent] hover:underline"
            >
              Open <ArrowUpRight size={14} aria-hidden />
            </Link>
          </Card>
        ) : null}
      </Section>
    </>
  )
}

function QuickAction({
  href,
  icon: Icon,
  title,
  body,
  badge,
}: {
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  body: string
  badge?: React.ReactNode
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-colors hover:bg-[--surface-2]">
        <div className="flex items-start justify-between gap-2">
          <Icon size={18} className="text-[--accent]" />
          {badge}
        </div>
        <h3 className="mt-3 font-medium">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{body}</p>
      </Card>
    </Link>
  )
}
