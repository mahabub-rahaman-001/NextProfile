import { notFound } from "next/navigation"
import QRCode from "qrcode"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { verifyPrintToken } from "@/lib/pdf/token"
import { publicContact } from "@/lib/profile/load"
import { absoluteUrl } from "@/lib/utils"

/**
 * A business card, 85 × 55 mm, with the QR that opens the public profile.
 * Printed at a job fair this does more work than any amount of SEO.
 */
export const dynamic = "force-dynamic"

export default async function PrintCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ token?: string; accent?: string }>
}) {
  const { userId } = await params
  const { token, accent: rawAccent } = await searchParams

  // This value is interpolated into a <style> block below. Anything other than
  // a plain hex colour could close the element and inject markup, so nothing
  // else is allowed through.
  const accent = rawAccent && /^#[0-9a-fA-F]{6}$/.test(rawAccent) ? rawAccent : "#0E5C4A"

  const viaToken = token ? verifyPrintToken(userId, token) : false
  if (!viaToken) {
    const session = await getSession()
    if (!session || session.id !== userId) notFound()
  }

  const user = await db.user.findUnique({ where: { id: userId }, include: { profile: true } })
  if (!user?.profile || !user.username) notFound()

  const url = absoluteUrl(`/view/${user.username}`)
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 400, errorCorrectionLevel: "M" })
  const c = publicContact(user.profile)

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page { size: 85mm 55mm; margin: 0; }
            html, body { margin: 0; padding: 0; background: #fff; }
            .card {
              width: 85mm; height: 55mm; box-sizing: border-box;
              padding: 6mm; display: flex; gap: 5mm; align-items: center;
              font-family: ui-sans-serif, system-ui, sans-serif; color: #14181c;
            }
            .card__left { flex: 1 1 auto; min-width: 0; }
            .card__name { font-size: 13pt; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
            .card__headline { font-size: 8pt; margin: 1mm 0 0; color: #4a5560; }
            .card__rule { width: 10mm; height: 1mm; background: ${accent}; margin: 2.5mm 0; }
            .card__line { font-size: 7.5pt; margin: 0.6mm 0; color: #4a5560; word-break: break-all; }
            .card__url { font-size: 7.5pt; color: ${accent}; font-weight: 600; }
            .card__qr { flex: 0 0 26mm; text-align: center; }
            .card__qr img { width: 26mm; height: 26mm; display: block; }
            .card__scan { font-size: 6pt; color: #8a939c; margin: 1mm 0 0; }
          `,
        }}
      />
      <div className="card">
        <div className="card__left">
          <p className="card__name">{user.profile.fullName}</p>
          {user.profile.headline ? <p className="card__headline">{user.profile.headline}</p> : null}
          <div className="card__rule" />
          {c.email ? <p className="card__line">{c.email}</p> : null}
          {c.phone ? <p className="card__line">{c.phone}</p> : null}
          {c.showLocation && user.profile.location ? (
            <p className="card__line">{user.profile.location}</p>
          ) : null}
          <p className="card__line card__url">{url.replace(/^https?:\/\//, "")}</p>
        </div>
        <div className="card__qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={`QR code for ${url}`} />
          <p className="card__scan">Scan for my full profile</p>
        </div>
      </div>
    </>
  )
}
