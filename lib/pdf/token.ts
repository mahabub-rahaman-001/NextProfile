import { createHmac, timingSafeEqual } from "node:crypto"

/** Short-lived HMAC so only the render service can read /print/[docId]. */
function secret() {
  const s = process.env.PRINT_TOKEN_SECRET
  if (!s) throw new Error("PRINT_TOKEN_SECRET is missing")
  return s
}

export function signPrintToken(docId: string, ttlSeconds = 60): string {
  const exp = Date.now() + ttlSeconds * 1000
  const sig = createHmac("sha256", secret()).update(`${docId}.${exp}`).digest("hex")
  return `${exp}.${sig}`
}

export function verifyPrintToken(docId: string, token: string): boolean {
  const [exp, sig] = token.split(".")
  if (!exp || !sig) return false
  if (Number(exp) < Date.now()) return false
  const expected = createHmac("sha256", secret()).update(`${docId}.${exp}`).digest("hex")
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))
  } catch {
    return false
  }
}
