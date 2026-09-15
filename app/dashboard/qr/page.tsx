import Link from "next/link"
import { Download } from "lucide-react"
import { requirePage } from "@/lib/auth"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Card, EmptyState } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { absoluteUrl } from "@/lib/utils"

export default async function QrPage() {
  const user = await requirePage()

  if (!user.username) {
    return (
      <>
        <PageHeader title="QR code" />
        <Section>
          <EmptyState
            title="Choose your profile address first"
            line="Your QR code points at your public profile, so it needs an address to point to."
            action={
              <Link href="/dashboard/portfolio">
                <Button>Choose an address</Button>
              </Link>
            }
          />
        </Section>
      </>
    )
  }

  const url = absoluteUrl(`/view/${user.username}`)

  return (
    <>
      <PageHeader
        title="QR code"
        blurb="For a CV header, a business card, an event badge or an email signature."
      />
      <Section>
        <div className="grid max-w-3xl gap-4 sm:grid-cols-[220px_1fr]">
          <Card className="flex items-center justify-center bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/qr?format=png&size=512"
              alt={`QR code linking to ${url}`}
              width={180}
              height={180}
            />
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-sm text-ink-soft">Points to</p>
              <p className="break-all font-medium">{url}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/api/qr?format=png&size=1024" download>
                <Button variant="secondary">
                  <Download size={16} aria-hidden /> PNG
                </Button>
              </a>
              <a href="/api/qr?format=svg" download>
                <Button variant="secondary">
                  <Download size={16} aria-hidden /> SVG
                </Button>
              </a>
            </div>
            <p className="text-sm text-ink-faint">
              PNG for screens and most printing. SVG when it needs to scale — a poster, or a printer
              that asks for vector artwork. Print it at 2cm or larger and keep the white border.
            </p>
          </Card>
        </div>
      </Section>
    </>
  )
}
