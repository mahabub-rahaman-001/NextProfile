import Link from "next/link"
import { FileText, Plus } from "lucide-react"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Badge, Card, EmptyState } from "@/components/ui/card"
import { NewDocumentButtons } from "./new-document"
import { TEMPLATES, isTemplateId } from "@/components/resume/templates"

export default async function ResumeListPage() {
  const user = await requirePage()
  const documents = await db.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <>
      <PageHeader
        title="Resume & CV"
        blurb="Every document is built from the same profile. Change a job title once and they all update."
        action={<NewDocumentButtons />}
      />
      <Section>
        {documents.length === 0 ? (
          <EmptyState
            title="No documents yet"
            line="Create a resume for job applications, or an academic CV for higher study."
            action={<NewDocumentButtons />}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const t = isTemplateId(doc.templateId) ? TEMPLATES[doc.templateId] : TEMPLATES.minimal
              return (
                <li key={doc.id}>
                  <Link href={`/dashboard/resume/${doc.id}`}>
                    <Card className="h-full transition-colors hover:bg-[--surface-2]">
                      <div className="flex items-start justify-between gap-2">
                        <FileText size={18} className="text-[--accent]" aria-hidden />
                        <Badge>{doc.kind === "CV" ? "CV" : "Resume"}</Badge>
                      </div>
                      <h2 className="mt-3 font-medium">{doc.name}</h2>
                      <p className="mt-1 text-sm text-ink-soft">
                        {t.name} template
                        {t.atsSafe ? " · ATS-safe" : ""}
                      </p>
                      <p className="mt-2 text-xs text-ink-faint">
                        Updated {doc.updatedAt.toLocaleDateString()}
                      </p>
                    </Card>
                  </Link>
                </li>
              )
            })}
            <li>
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[--line] p-6">
                <NewDocumentButtons compact />
              </div>
            </li>
          </ul>
        )}

        <p className="mt-6 max-w-measure text-sm text-ink-faint">
          <Plus size={13} className="inline" aria-hidden /> Tip: make a second copy tailored to a
          specific employer. Both stay in sync with your profile.
        </p>
      </Section>
    </>
  )
}
