/**
 * Next.js runs this once, before the first request is served.
 * It exists so a misconfigured deployment fails at boot with a list of what is
 * missing, instead of at whichever feature happens to need the value first.
 */
export async function register() {
  // Only on the Node.js runtime — the edge runtime has neither the env vars nor
  // the features being checked.
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { assertEnvironment } = await import("@/lib/env")
  assertEnvironment()
}
