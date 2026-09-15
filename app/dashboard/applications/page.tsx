import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { ApplicationsClient } from "./applications-client"

export default async function ApplicationsPage() {
  const user = await requirePage()

  const [applications, documents] = await Promise.all([
    db.application.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    db.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, kind: true },
    }),
  ])

  return (
    <>
      <PageHeader
        title="Applications"
        blurb="Which resume went where, what the ad asked for, and what happened next."
      />
      <Section>
        <div className="max-w-4xl">
          <ApplicationsClient
            applications={JSON.parse(JSON.stringify(applications))}
            documents={documents}
          />
        </div>
      </Section>
    </>
  )
}
