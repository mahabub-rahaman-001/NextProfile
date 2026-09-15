import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { docConfigSchema } from "@/lib/validation"
import { renderPdf } from "@/lib/pdf/render"
import { LIMITS, limit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(
  req: Request,
  { params }: { params: Promise<{ docId: string }> },
) {
  const { docId } = await params

  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 })
  }

  // Each of these starts a headless browser. LIMITS.pdf existed for this.
  const gate = await limit(`pdf-doc:${user.id}`, LIMITS.pdf.max, LIMITS.pdf.windowMs)
  if (!gate.ok) return tooMany(gate)

  const doc = await db.document.findFirst({ where: { id: docId, userId: user.id } })
  if (!doc) {
    return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 })
  }

  const config = docConfigSchema.parse(doc.config ?? {})
  const origin = new URL(req.url).origin

  try {
    const pdf = await renderPdf({ docId: doc.id, format: config.paper, appUrl: origin })
    const filename = `${doc.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (e) {
    console.error("PDF render failed", e)
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_ERROR",
          message: "Couldn't build the PDF just now. Your document is unchanged.",
        },
      },
      { status: 502 },
    )
  }
}
