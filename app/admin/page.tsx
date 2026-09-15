import Link from "next/link"
import { requireAdminPage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Card } from "@/components/ui/card"

export default async function AdminOverview() {
  await requireAdminPage()

  const since7 = new Date(Date.now() - 7 * 86_400_000)
  const since30 = new Date(Date.now() - 30 * 86_400_000)

  const [
    users, newUsers, onboarded, published, documents, versions, applications,
    openReports, aiCalls, events, suspended,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since7 } } }),
    db.profile.count({ where: { onboardedAt: { not: null } } }),
    db.portfolio.count({ where: { published: true } }),
    db.document.count(),
    db.documentVersion.count(),
    db.application.count({ where: { deletedAt: null } }),
    db.abuseReport.count({ where: { status: "OPEN" } }),
    db.aIRequest.count({ where: { createdAt: { gte: since30 } } }),
    db.analyticsEvent.count({ where: { createdAt: { gte: since30 } } }),
    db.user.count({ where: { suspendedAt: { not: null } } }),
  ])

  // The funnel number that actually matters, from docs/00 §5.
  const publishRate = users > 0 ? Math.round((published / users) * 100) : 0

  return (
    <>
      <PageHeader
        title="Overview"
        blurb="How the platform is doing, and anything waiting on a human."
      />
      <Section>
        {openReports > 0 ? (
          <Link href="/admin/reports" className="mb-4 block">
            <Card className="border-l-2 border-l-[--danger]">
              <p className="font-medium">
                {openReports} report{openReports === 1 ? "" : "s"} waiting for review
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Reports are never actioned automatically — someone has to read them.
              </p>
            </Card>
          </Link>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Accounts" value={users} note={`${newUsers} in the last 7 days`} />
          <Stat label="Finished onboarding" value={onboarded} note={pct(onboarded, users)} />
          <Stat
            label="Published profiles"
            value={published}
            note={`${publishRate}% of signups — beta target 35%`}
            tone={publishRate >= 35 ? "good" : "warn"}
          />
          <Stat label="Suspended" value={suspended} note={suspended ? "review periodically" : "none"} />
          <Stat label="Documents" value={documents} />
          <Stat label="Frozen versions" value={versions} />
          <Stat label="Applications tracked" value={applications} />
          <Stat label="AI calls (30d)" value={aiCalls} note="watch cost per active user" />
        </div>

        <Card className="mt-4">
          <h2 className="text-base font-semibold">Analytics events (30 days)</h2>
          <p className="mt-1 text-3xl font-semibold tabular-nums" data-tabular>
            {events.toLocaleString()}
          </p>
          <p className="mt-2 max-w-measure text-sm text-ink-soft">
            Stored with a daily-rotating visitor hash and no IP addresses, so these cannot be traced
            back to individual visitors — by design, and worth keeping that way.
          </p>
        </Card>
      </Section>
    </>
  )
}

function pct(part: number, whole: number) {
  if (!whole) return "—"
  return `${Math.round((part / whole) * 100)}% of accounts`
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: number
  note?: string
  tone?: "good" | "warn"
}) {
  return (
    <Card>
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums" data-tabular>
        {value.toLocaleString()}
      </p>
      {note ? (
        <p
          className={
            tone === "good"
              ? "mt-1 text-xs text-[--success]"
              : tone === "warn"
                ? "mt-1 text-xs text-[--warning]"
                : "mt-1 text-xs text-ink-faint"
          }
        >
          {note}
        </p>
      ) : null}
    </Card>
  )
}
