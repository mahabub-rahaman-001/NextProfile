import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Card, EmptyState } from "@/components/ui/card"

const LABELS: Record<string, string> = {
  profile_view: "Portfolio views",
  project_view: "Project views",
  resume_download: "Resume downloads",
  contact_click: "Contact clicks",
  link_click: "Link clicks",
}

export default async function AnalyticsPage() {
  const user = await requirePage()
  const since = new Date(Date.now() - 30 * 86_400_000)

  const [grouped, uniques, total] = await Promise.all([
    db.analyticsEvent.groupBy({
      by: ["type"],
      where: { userId: user.id, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    // COUNT(DISTINCT) in the database: one row back whatever the volume.
    // `findMany … distinct` pulled every distinct visitor hash into Node just
    // to read its length, which grew without bound on a popular profile.
    // Parameterised tagged template — the values never enter the SQL text.
    db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT "visitorHash")::bigint AS count
      FROM "AnalyticsEvent"
      WHERE "userId" = ${user.id}
        AND "type" = 'profile_view'
        AND "createdAt" >= ${since}
    `,
    db.analyticsEvent.count({ where: { userId: user.id } }),
  ])

  const counts = new Map(grouped.map((g) => [g.type, g._count._all]))
  // COUNT returns bigint over the wire; Number is safe for a visitor count.
  const uniqueVisitors = Number(uniques[0]?.count ?? 0)

  return (
    <>
      <PageHeader
        title="Analytics"
        blurb="The last 30 days. Visitors are counted with a hash that changes daily — no IP addresses are stored."
      />
      <Section>
        {total === 0 ? (
          <EmptyState
            title="Nothing to show yet"
            line="Once your profile is published and people open it, views and downloads appear here."
          />
        ) : (
          <div className="grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Unique visitors" value={uniqueVisitors} />
            {Object.entries(LABELS).map(([key, label]) => (
              <Stat key={key} label={label} value={counts.get(key) ?? 0} />
            ))}
          </div>
        )}
      </Section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums" data-tabular>
        {value.toLocaleString()}
      </p>
    </Card>
  )
}
