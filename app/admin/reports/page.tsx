import { requireAdminPage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/ui/card"
import { ReportsQueue } from "./reports-queue"

export const dynamic = "force-dynamic"

export default async function AdminReports() {
  await requireAdminPage()

  const reports = await db.abuseReport.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  })

  // Reports name a username; pull the account so an admin can act without
  // going to look it up separately.
  const usernames = [...new Set(reports.map((r) => r.username))]
  const users = await db.user.findMany({
    where: { username: { in: usernames } },
    select: {
      id: true,
      username: true,
      suspendedAt: true,
      profile: { select: { fullName: true } },
      portfolio: { select: { published: true } },
    },
  })
  const byUsername = new Map(users.map((u) => [u.username!, u]))

  return (
    <>
      <PageHeader
        title="Reports"
        blurb="Sent by people viewing public profiles. Nothing here is actioned automatically."
      />
      <Section>
        {reports.length === 0 ? (
          <EmptyState
            title="No reports"
            line="When someone reports a public profile, it appears here for a person to read."
          />
        ) : (
          <ReportsQueue
            reports={reports.map((r) => {
              const u = byUsername.get(r.username)
              return {
                id: r.id,
                username: r.username,
                reason: r.reason,
                detail: r.detail,
                status: r.status,
                adminNote: r.adminNote,
                reviewedBy: r.reviewedBy,
                createdAt: r.createdAt.toISOString(),
                userId: u?.id ?? null,
                fullName: u?.profile?.fullName ?? null,
                published: Boolean(u?.portfolio?.published),
                suspended: Boolean(u?.suspendedAt),
              }
            })}
          />
        )}
      </Section>
    </>
  )
}
