import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { renderPdf } from "@/lib/pdf/render"
import { LIMITS, limit, tooMany } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** Print-ready business card PDF, 85 × 55 mm. */
export async function GET(req: Request) {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 })
  }

  // Each of these starts a headless browser. LIMITS.pdf existed for this.
  const gate = await limit(`pdf-card:${user.id}`, LIMITS.pdf.max, LIMITS.pdf.windowMs)
  if (!gate.ok) return tooMany(gate)

  if (!user.username) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Choose your profile address first." } },
      { status: 400 },
    )
  }

  try {
    const pdf = await renderPdf({
      docId: user.id,
      format: "A4", // ignored: the card's own @page rule wins
      appUrl: new URL(req.url).origin,
      path: "print/card",
    })
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="nextprofile-card-${user.username}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (e) {
    console.error("Card render failed", e)
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message: "Couldn't build the card just now." } },
      { status: 502 },
    )
  }
}
