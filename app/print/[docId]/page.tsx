import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { verifyPrintToken } from "@/lib/pdf/token"
import { loadFullProfile } from "@/lib/profile/load"
import { docConfigSchema } from "@/lib/validation"
import { DocumentRenderer } from "@/components/resume/templates"

/**
 * Print-only HTML. Two ways in:
 *   · the owner, signed in (so "Print view" works in the browser)
 *   · the render service, with a 60-second HMAC token
 * Nothing else.
 */
export const dynamic = "force-dynamic"

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ docId: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { docId } = await params
  const { token } = await searchParams

  const doc = await db.document.findUnique({ where: { id: docId } })
  if (!doc) notFound()

  const viaToken = token ? verifyPrintToken(docId, token) : false
  if (!viaToken) {
    const session = await getSession()
    if (!session || session.id !== doc.userId) notFound()
  }

  const data = await loadFullProfile(doc.userId)
  if (!data) notFound()

  const config = docConfigSchema.parse(doc.config ?? {})

  // The page box is the one thing the stylesheet cannot know in advance, so the
  // document's paper choice is emitted here — and the renderer is told to use it.
  const pageRule = `@page { size: ${config.paper === "LETTER" ? "Letter" : "A4"}; margin: 16mm 15mm; }`

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: pageRule }} />
      <DocumentRenderer data={data} kind={doc.kind} templateId={doc.templateId} config={config} />
    </main>
  )
}
