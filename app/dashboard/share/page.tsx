import Link from "next/link"
import { Download } from "lucide-react"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { ShareClient } from "./share-client"

export default async function SharingPage() {
  const user = await requirePage()

  const [links, documents] = await Promise.all([
    db.shareLink.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { document: { select: { name: true } } },
    }),
    db.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true },
    }),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  return (
    <>
      <PageHeader
        title="Sharing"
        blurb="Private links, an embeddable card, and a printable business card with your QR code."
      />
      <Section>
        <div className="max-w-3xl space-y-4">
          <ShareClient
            appUrl={appUrl}
            username={user.username}
            documents={documents}
            links={links.map((l) => ({
              id: l.id,
              token: l.token,
              label: l.label,
              documentId: l.documentId,
              documentName: l.document?.name ?? null,
              expiresAt: l.expiresAt?.toISOString() ?? null,
              revokedAt: l.revokedAt?.toISOString() ?? null,
              views: l.views,
              lastViewAt: l.lastViewAt?.toISOString() ?? null,
            }))}
          />

          <Card className="space-y-3">
            <CardTitle>Printable business card</CardTitle>
            <p className="-mt-1 text-sm text-ink-soft">
              85 × 55 mm with your name, contact details and a QR code that opens your profile.
              Useful at a job fair, where a link in a chat window is not.
            </p>
            {user.username ? (
              <a href="/api/card" download>
                <Button variant="secondary">
                  <Download size={16} aria-hidden /> Download card PDF
                </Button>
              </a>
            ) : (
              <p className="text-sm text-ink-faint">
                <Link href="/dashboard/portfolio" className="text-[--accent] hover:underline">
                  Choose your profile address
                </Link>{" "}
                first — the card needs somewhere to point.
              </p>
            )}
          </Card>
        </div>
      </Section>
    </>
  )
}
