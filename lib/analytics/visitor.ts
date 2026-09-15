import { createHmac } from "node:crypto"

/**
 * A visitor is a hash of IP + user agent with a salt that rotates daily.
 * Unique counts stay accurate within a day, and nobody can be followed across
 * weeks. Raw IP addresses are never stored.
 */
export function dailySalt(d = new Date()): string {
  const day = d.toISOString().slice(0, 10)
  return `${process.env.ANALYTICS_SALT ?? "dev-salt"}:${day}`
}

export function visitorHash(ip: string, userAgent: string): string {
  return createHmac("sha256", dailySalt()).update(`${ip}|${userAgent}`).digest("hex").slice(0, 32)
}

const BOT = /bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|curl|wget|headless/i

export function isBot(userAgent: string): boolean {
  return BOT.test(userAgent)
}

export function hostOf(referrer: string | null): string | null {
  if (!referrer) return null
  try {
    return new URL(referrer).host
  } catch {
    return null
  }
}
