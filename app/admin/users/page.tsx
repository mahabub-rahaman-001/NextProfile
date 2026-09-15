import { requireAdminPage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { UsersTable } from "./users-table"

export const dynamic = "force-dynamic"

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAdminPage()
  const { q } = await searchParams
  const query = (q ?? "").trim()

  const users = await db.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
            { profile: { fullName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      profile: { select: { fullName: true, profileType: true, completeness: true } },
      portfolio: { select: { published: true } },
      _count: { select: { documents: true, applications: true } },
    },
  })

  return (
    <>
      <PageHeader
        title="Users"
        blurb="Newest first, 100 at a time. Suspending keeps everything — it only stops sign-in and hides the public profile."
      />
      <Section>
        <UsersTable
          query={query}
          users={users.map((u) => ({
            id: u.id,
            email: u.email,
            username: u.username,
            fullName: u.profile?.fullName ?? "",
            profileType: u.profile?.profileType ?? "—",
            completeness: u.profile?.completeness ?? 0,
            published: Boolean(u.portfolio?.published),
            role: u.role,
            suspendedAt: u.suspendedAt?.toISOString() ?? null,
            suspendedReason: u.suspendedReason,
            documents: u._count.documents,
            applications: u._count.applications,
            createdAt: u.createdAt.toISOString(),
          }))}
        />
      </Section>
    </>
  )
}
