import "server-only"

import type * as RateLimit from "./rate-limit"

/**
 * The rate limits of the e2e test build only (E2E=1, see next.config.ts):
 * counted in this server's memory, so nothing reaches Firestore. The same
 * windows as lib/rate-limit.ts.
 */

const kept = globalThis as typeof globalThis & {
  __e2eRateLimits?: Map<string, { count: number; expiresAt: number }>
}
const counts = (kept.__e2eRateLimits ??= new Map())

export const withinLimit: typeof RateLimit.withinLimit = async (
  limit,
  sender,
  now = Date.now()
) => {
  const key = `${limit.name}:${sender}`
  const entry = counts.get(key)
  const current = entry && entry.expiresAt > now ? entry : null
  if (current && current.count >= limit.max) return false
  counts.set(key, {
    count: (current?.count ?? 0) + 1,
    expiresAt: current?.expiresAt ?? now + limit.windowMs,
  })
  return true
}

export const sweepRateLimits: typeof RateLimit.sweepRateLimits = async (
  now = Date.now()
) => {
  for (const [key, { expiresAt }] of counts)
    if (expiresAt <= now) counts.delete(key)
}

// Plain: reads headers only.
export { addressOf } from "./rate-limit"
