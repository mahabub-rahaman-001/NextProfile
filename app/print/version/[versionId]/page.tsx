import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { verifyPrintToken } from "@/lib/pdf/token"
import { docConfigSchema } from "@/lib/validation"
import { DocumentRenderer } from "@/components/resume/templates"
import type { ProfileData } from "@/lib/profile/load"

/** Renders a frozen version exactly as it was — from the snapshot, not live data. */
export const dynamic = "force-dynamic"

export default async function PrintVersionPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { versionId } = await params
  const { token } = await searchParams

  const version = await db.documentVersion.findUnique({ where: { id: versionId } })
  if (!version) notFound()

  const viaToken = token ? verifyPrintToken(versionId, token) : false
  if (!viaToken) {
    const session = await getSession()
    if (!session || session.id !== version.userId) notFound()
  }

  const config = docConfigSchema.parse(version.config ?? {})
  const data = version.snapshot as unknown as ProfileData
  const pageRule = `@page { size: ${config.paper === "LETTER" ? "Letter" : "A4"}; margin: 16mm 15mm; }`

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: pageRule }} />
      <DocumentRenderer
        data={data}
        kind={version.kind}
        templateId={version.templateId}
        config={config}
      />
    </main>
  )
}
