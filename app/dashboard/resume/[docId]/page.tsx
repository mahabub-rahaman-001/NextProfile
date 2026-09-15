import { notFound } from "next/navigation"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { loadFullProfile } from "@/lib/profile/load"
import { docConfigSchema } from "@/lib/validation"
import { availableSections } from "@/components/resume/engine/resolve"
import { DocumentEditor } from "./document-editor"

export default async function DocumentPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params
  const user = await requirePage()

  const doc = await db.document.findFirst({ where: { id: docId, userId: user.id } })
  if (!doc) notFound()

  const data = await loadFullProfile(user.id)
  if (!data) notFound()

  const config = docConfigSchema.parse(doc.config ?? {})
  const available = availableSections(data, doc.kind)

  const versions = await db.documentVersion.findMany({
    where: { documentId: doc.id, userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, templateId: true, createdAt: true },
    take: 20,
  })

  return (
    <DocumentEditor
      docId={doc.id}
      kind={doc.kind}
      initialName={doc.name}
      initialTemplateId={doc.templateId}
      initialConfig={config}
      available={available}
      data={JSON.parse(JSON.stringify(data))}
      versions={versions.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() }))}
    />
  )
}
