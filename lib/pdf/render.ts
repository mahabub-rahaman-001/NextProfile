import { createHash } from "node:crypto"
import { signPrintToken } from "./token"

/**
 * PDF rendering.
 *
 * Production: a separate always-on container with Chromium (RENDER_SERVICE_URL).
 * A bundled Chromium does not fit comfortably in a serverless function — see
 * docs/00-PRODUCT-PLAN.md §15 for why this is its own service.
 *
 * Development: if no render service is configured, we drive a local Chromium
 * through playwright-core so the whole flow works on one machine.
 */

export type RenderInput = {
  docId: string
  format: "A4" | "LETTER"
  appUrl?: string
  /** Which print route to render: "print" (a live document), "print/version", "print/card". */
  path?: string
}

export function pdfHash(parts: (string | number | null | undefined)[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 32)
}

export async function renderPdf({
  docId,
  format,
  appUrl,
  path = "print",
}: RenderInput): Promise<Buffer> {
  const base = appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const token = signPrintToken(docId)
  const url = `${base.replace(/\/$/, "")}/${path}/${docId}?token=${encodeURIComponent(token)}`

  const service = process.env.RENDER_SERVICE_URL
  if (service) {
    const res = await fetch(`${service.replace(/\/$/, "")}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Render-Secret": process.env.RENDER_SERVICE_SECRET ?? "",
      },
      body: JSON.stringify({ docId, token, format, url }),
    })
    if (!res.ok) throw new Error(`Render service responded ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  }

  return renderLocally(url, format)
}

/** Dev-only path: a local Chromium, same print route, same stylesheet. */
async function renderLocally(url: string, format: "A4" | "LETTER"): Promise<Buffer> {
  const { chromium } = await import("playwright-core")
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  })
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle", timeout: 25_000 })
    const pdf = await page.pdf({
      format: format === "LETTER" ? "Letter" : "A4",
      printBackground: true,
      // The print route's @page rule is the source of truth for size and
      // margins, so every page — not just the first — is inset correctly.
      preferCSSPageSize: true,
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
