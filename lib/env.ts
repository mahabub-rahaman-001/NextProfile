/**
 * Configuration check, run once at startup by instrumentation.ts.
 *
 * Every value below was already required by some code path — the difference is
 * when you find out. Before this, an empty PRINT_TOKEN_SECRET was a 502 the
 * first time a user downloaded a PDF, and a missing SMTP host was a reset email
 * that silently never arrived. Both now fail at boot, naming the variable.
 */

type Problem = { level: "error" | "warning"; message: string }

const isProduction = process.env.NODE_ENV === "production"
const has = (key: string) => Boolean(process.env[key]?.trim())

export function checkEnvironment(): Problem[] {
  const problems: Problem[] = []
  const error = (message: string) => problems.push({ level: "error", message })
  const warn = (message: string) => problems.push({ level: "warning", message })

  // ---- always required -------------------------------------------------
  if (!has("DATABASE_URL")) error("DATABASE_URL is not set — the app cannot reach its database.")

  const secret = process.env.AUTH_SECRET ?? ""
  if (!secret.trim()) error("AUTH_SECRET is not set — nobody can sign in.")
  else if (secret.length < 16) error("AUTH_SECRET is shorter than 16 characters.")

  if (!has("PRINT_TOKEN_SECRET")) {
    error("PRINT_TOKEN_SECRET is not set — every PDF and business-card download will fail.")
  }

  if (!has("ANALYTICS_SALT")) {
    // Not fatal: analytics degrade rather than break. But the fallback salt is
    // a literal in the source, so the visitor hashes stop being anonymous in
    // any meaningful sense.
    const level = isProduction ? error : warn
    level("ANALYTICS_SALT is not set — visitor hashes fall back to a salt that is public in the source.")
  }

  // ---- production only -------------------------------------------------
  if (isProduction) {
    // Warned, not fatal. NODE_ENV is "production" for ANY built server —
    // including the local one `tests/e2e/admin-and-reset.mjs` runs against,
    // which needs this flag to read the link off the page. Refusing to start
    // would break that suite. The flag already defaults to false and has to be
    // turned on deliberately, so a loud line in the boot log is the right
    // amount of friction.
    //
    // (It also cannot be decided from NEXT_PUBLIC_APP_URL: Next inlines every
    // NEXT_PUBLIC_* value at build time, so the runtime value is whatever the
    // build machine had.)
    if (process.env.AUTH_DEV_SHOW_RESET_LINK === "true") {
      warn(
        'AUTH_DEV_SHOW_RESET_LINK is "true" — password reset links are shown on screen to anyone who asks for one. Set it to "false" on any server other people can reach.',
      )
    }

    if (!has("SMTP_HOST")) {
      error("SMTP_HOST is not set — password reset emails cannot be delivered, so nobody can recover an account.")
    }

    if (!has("NEXT_PUBLIC_APP_URL")) {
      error("NEXT_PUBLIC_APP_URL is not set — reset links and QR codes would point at localhost.")
    }

    // Serverless and multi-instance deployments get a fresh module scope per
    // invocation, so the in-memory limiter never sees a second request. Without
    // Redis there is effectively no rate limiting at all.
    if (!has("REDIS_URL")) {
      warn(
        "REDIS_URL is not set — rate limiting falls back to per-process memory, which does not work on serverless or across multiple instances.",
      )
    }

    // A bundled Chromium does not fit in a serverless function.
    if (!has("RENDER_SERVICE_URL")) {
      warn(
        "RENDER_SERVICE_URL is not set — PDF rendering falls back to a local Chromium, which will not run on a serverless host.",
      )
    }

    if (process.env.STORAGE_DRIVER !== "s3") {
      warn(
        'STORAGE_DRIVER is not "s3" — uploads are written to local disk and will be lost on the next deploy or restart.',
      )
    } else if (!has("S3_BUCKET") || !has("S3_ACCESS_KEY_ID") || !has("S3_SECRET_ACCESS_KEY")) {
      error('STORAGE_DRIVER is "s3" but S3_BUCKET, S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY is missing.')
    }
  }

  // ---- features that are optional, but half-configured is a bug --------
  if (process.env.AI_ENABLED === "true" && !has("LLM_API_KEY")) {
    warn('AI_ENABLED is "true" but LLM_API_KEY is not set — AI actions will fail.')
  }

  return problems
}

/** Logs every problem; throws if any of them is fatal. */
export function assertEnvironment(): void {
  const problems = checkEnvironment()
  if (!problems.length) return

  const errors = problems.filter((p) => p.level === "error")

  for (const p of problems) {
    const prefix = p.level === "error" ? "✗ config error" : "! config warning"
    console[p.level === "error" ? "error" : "warn"](`${prefix}: ${p.message}`)
  }

  if (errors.length) {
    throw new Error(
      `Refusing to start: ${errors.length} configuration ${errors.length === 1 ? "problem" : "problems"} listed above.`,
    )
  }
}
