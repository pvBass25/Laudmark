import type { NextRequest } from 'next/server'

/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Zero dependencies — works immediately in dev and on a single warm serverless
 * instance. It does NOT share state across instances, so on a horizontally
 * scaled deployment a determined attacker could get `limit × instanceCount`
 * requests through. That's still a meaningful cap vs. the current "unlimited",
 * and it's enough to stop casual spam of the public endpoints.
 *
 * To make it global, swap `hit()` for an Upstash/Redis-backed call with the
 * same signature — the call sites don't change.
 */

type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()
const MAX_KEYS = 10_000 // safety cap so the map can't grow unbounded

export interface RateLimitResult {
  ok: boolean
  remaining: number
  /** Seconds until the window resets (only meaningful when !ok). */
  retryAfter: number
}

/**
 * Record a hit for `key` and report whether it's within `limit` per `windowMs`.
 */
export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now >= existing.resetAt) {
    // Opportunistic cleanup of expired buckets when the map gets large.
    if (store.size >= MAX_KEYS) {
      for (const [k, b] of store) if (now >= b.resetAt) store.delete(k)
    }
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return { ok: true, remaining: limit - existing.count, retryAfter: 0 }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
