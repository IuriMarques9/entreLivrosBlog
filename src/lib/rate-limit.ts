import 'server-only'
import { headers } from 'next/headers'
import { redisRateLimit } from './rate-limit-redis'
import { createClient } from './supabase/server'

// Simple in-memory rate limiter for server actions and route handlers.
// State lives in the process memory (per instance), so it is not shared across
// serverless instances. For production-grade limits, back this with a shared
// store (Redis / Supabase). Good enough to stop casual spam/abuse from a
// single client.
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  }
}

// Shared counter in the project's own Postgres via the rate_limit_hit RPC
// (migration 0005). Returns null when the function is not deployed yet or on
// any error, so callers fall back to the in-memory limiter.
async function supabaseRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('rate_limit_hit', {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    if (error || !data || !data[0]) return null
    const row = data[0] as {
      allowed: boolean
      remaining: number
      reset_at: string
    }
    return {
      allowed: row.allowed,
      remaining: row.remaining,
      resetAt: new Date(row.reset_at).getTime(),
    }
  } catch {
    return null
  }
}

// Shared rate limit, consistent across serverless instances. Tries Upstash
// (if configured) -> the project's own Postgres (rate_limit_hit RPC) -> the
// per-instance in-memory limiter as last resort.
export async function rateLimitDistributed(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = await redisRateLimit(key, limit, windowMs)
  if (redis) return redis
  const pg = await supabaseRateLimit(key, limit, windowMs)
  if (pg) return pg
  return rateLimit(key, limit, windowMs)
}

// Reads the caller IP from the forwarded headers. Works inside server actions
// and route handlers. Falls back to "unknown" when no header is present.
export async function getRequestIp(): Promise<string> {
  const h = await headers()
  // Prefer x-real-ip: Vercel/its proxy sets it to the true client IP, and
  // unlike x-forwarded-for a client can't prepend spoofed entries to it.
  const real = h.get('x-real-ip')
  if (real) return real.trim()
  // Fall back to the LAST x-forwarded-for hop — the entry appended by the
  // trusted proxy — never the leftmost, which is fully attacker-controlled.
  const fwd = h.get('x-forwarded-for')
  if (fwd) {
    const last = fwd
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .pop()
    if (last) return last
  }
  return 'unknown'
}
