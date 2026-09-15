import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { requireUser } from "@/lib/auth"
import { absoluteUrl } from "@/lib/utils"

/**
 * QR of the user's own public URL. Generated server-side and cached by URL —
 * with a quiet zone wide enough to survive being printed at 2cm.
 */
export async function GET(req: Request) {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 })
  }

  if (!user.username) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Choose your profile address first." } },
      { status: 400 },
    )
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format") === "svg" ? "svg" : "png"
  const size = Math.min(Math.max(Number(searchParams.get("size") ?? 512), 128), 2048)
  const target = absoluteUrl(`/view/${user.username}`)

  const options = {
    errorCorrectionLevel: "M" as const,
    margin: 4,
    width: size,
    color: { dark: "#000000ff", light: "#ffffffff" },
  }

  if (format === "svg") {
    const svg = await QRCode.toString(target, { ...options, type: "svg" })
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="nextprofile-${user.username}.svg"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  }

  const buffer = await QRCode.toBuffer(target, { ...options, type: "png" })
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  })
}
