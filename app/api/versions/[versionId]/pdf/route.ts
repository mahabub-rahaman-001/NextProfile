import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { docConfigSchema } from "@/lib/validation"
import { renderPdf } from "@/lib/pdf/render"
import { LIMITS, limit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** The PDF exactly as it was when this version was saved. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params

  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 })
  }

  // Each of these starts a headless browser. LIMITS.pdf existed for this.
  const gate = await limit(`pdf-version:${user.id}`, LIMITS.pdf.max, LIMITS.pdf.windowMs)
  if (!gate.ok) return tooMany(gate)

  const version = await db.documentVersion.findFirst({
    where: { id: versionId, userId: user.id },
    include: { document: { select: { name: true } } },
  })
  if (!version) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 })

  const config = docConfigSchema.parse(version.config ?? {})

  try {
    const pdf = await renderPdf({
      docId: versionId,
      format: config.paper,
      appUrl: new URL(req.url).origin,
      path: "print/version",
    })
    const stamp = version.createdAt.toISOString().slice(0, 10)
    const name = `${(version.document?.name ?? "resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${stamp}.pdf`

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (e) {
    console.error("Version PDF failed", e)
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message: "Couldn't build that PDF just now." } },
      { status: 502 },
    )
  }
}
