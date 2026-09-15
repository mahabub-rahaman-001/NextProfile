import Redis from "ioredis"

/**
 * Multi-instance aware sliding window limiter.
 *
 * If REDIS_URL is provided, uses Redis (safe for multiple instances).
 * If not, falls back to in-memory Map (fine for single instance / local dev).
 */

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: false })
  : null

// ioredis emits "error" on an EventEmitter. With no listener attached, Node
// treats that as an unhandled exception and the process exits — so a Redis
// blip would take the whole site down rather than degrade rate limiting.
redis?.on("error", (e) => {
  console.error("Rate limiter: Redis connection error", e.message)
})

type Hit = { count: number; resetAt: number }

const buckets = new Map<string, Hit>()

/** Stop the Map growing without bound in a long-running process (fallback mode only). */
function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, hit] of buckets) if (hit.resetAt < now) buckets.delete(key)
}

export type LimitResult = { ok: boolean; remaining: number; resetAt: number; retryAfter: number }

export async function limit(key: string, max: number, windowMs: number): Promise<LimitResult> {
  const now = Date.now()

  if (redis) {
    try {
      const pipeline = redis.pipeline()
      pipeline.incr(key)
      pipeline.pttl(key)
      const results = await pipeline.exec()

      // Fallback error handling if Redis is down
      if (!results || results.length < 2) {
        return memoryLimit(key, max, windowMs, now)
      }

      const count = (results[0][1] as number) || 1
      const pttl = (results[1][1] as number) || -1

      if (count === 1 || pttl === -1) {
        await redis.pexpire(key, windowMs)
      }

      const actualResetAt = now + (pttl > 0 ? pttl : windowMs)
      const ok = count <= max

      return {
        ok,
        remaining: Math.max(0, max - count),
        resetAt: actualResetAt,
        retryAfter: ok ? 0 : Math.ceil((actualResetAt - now) / 1000),
      }
    } catch (e) {
      // Redis unreachable. `pipeline.exec()` rejects rather than returning a
      // short result, and an unhandled rejection here would turn every sign-in
      // into a 500. Degrade to the in-process limiter instead: weaker across
      // instances, but still a limit, and the site stays up.
      console.error("Rate limiter: Redis unavailable, falling back to memory", e)
      return memoryLimit(key, max, windowMs, now)
    }
  }

  return memoryLimit(key, max, windowMs, now)
}

/** Per-process sliding window. Used as the fallback and in local development. */
function memoryLimit(key: string, max: number, windowMs: number, now: number): LimitResult {
  const resetAt = now + windowMs

  // Fallback to local Map
  sweep(now)
  const hit = buckets.get(key)
  if (!hit || hit.resetAt < now) {
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: max - 1, resetAt, retryAfter: 0 }
  }

  hit.count += 1
  const ok = hit.count <= max
  return {
    ok,
    remaining: Math.max(0, max - hit.count),
    resetAt: hit.resetAt,
    retryAfter: ok ? 0 : Math.ceil((hit.resetAt - now) / 1000),
  }
}

/**
 * Caller IP, read so a client cannot choose it.
 *
 * `X-Forwarded-For` is a list that each proxy APPENDS to, so the leftmost entry
 * is whatever the original caller sent — attacker-controlled, and useless as a
 * rate-limit key. Only the last N entries were written by infrastructure we
 * control, so we count in from the RIGHT by the number of proxies in front of
 * the app.
 *
 * TRUSTED_PROXY_HOPS is that number. It defaults to 1, which is correct on
 * Vercel and on a single nginx or load balancer. Behind Cloudflare in front of
 * your own proxy it is 2. Set it to 0 when nothing sits in front of the app:
 * the header is then ignored entirely rather than believed.
 *
 * Getting this too HIGH is the dangerous direction — it starts reading entries
 * the caller supplied — so an out-of-range value falls back to 1.
 */
const TRUSTED_HOPS = (() => {
  const raw = Number(process.env.TRUSTED_PROXY_HOPS ?? 1)
  if (!Number.isInteger(raw) || raw < 0 || raw > 8) return 1
  return raw
})()

export function clientIpFrom(headers: Headers): string {
  if (TRUSTED_HOPS === 0) return "0.0.0.0"

  const chain = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  if (chain.length) {
    // The entry our own outermost proxy wrote. If the chain is shorter than the
    // hop count the caller sent nothing, so the first entry is already ours.
    const index = Math.max(0, chain.length - TRUSTED_HOPS)
    return chain[index]
  }

  // Single-value headers a proxy sets directly. Same trust assumption.
  return headers.get("x-real-ip")?.trim() || "0.0.0.0"
}

/** Caller IP, as far as it can be trusted behind a proxy. */
export function clientIp(req: Request): string {
  return clientIpFrom(req.headers)
}

export const LIMITS = {
  auth: { max: 10, windowMs: 60_000 },
  ai: { max: 20, windowMs: 60_000 },
  analyse: { max: 30, windowMs: 60_000 },
  analytics: { max: 60, windowMs: 60_000 },
  report: { max: 5, windowMs: 600_000 },
  pdf: { max: 20, windowMs: 300_000 },
  upload: { max: 20, windowMs: 300_000 },
} as const

export function tooMany(result: LimitResult) {
  return new Response(
    JSON.stringify({
      error: {
        code: "RATE_LIMITED",
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
      },
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfter),
      },
    },
  )
}
