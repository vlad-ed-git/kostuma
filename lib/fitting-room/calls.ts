import type { Render } from "./render-plan"

/**
 * How often Kostuma asks YouCam (todo ENG-01). YouCam takes at most 250
 * requests per 300 s per key and per IP address (docs, "Rate Limit"), and
 * Kostuma has one key: that is the whole site's budget. Every API call
 * takes a token from one site-wide bucket (Firestore `limits/youcam`, in a
 * transaction), which holds at most CAPACITY and refills PER_SECOND: in any
 * 300 s, at most CAPACITY + 300 × PER_SECOND + DEBT calls, under the
 * limit. An empty bucket makes a render wait (`busy`), never fail. Deleting
 * a task may run a little into debt: it is never put off.
 */

export const CAPACITY = 30
export const PER_SECOND = 0.65
export const DEBT = 10

/** The bucket as stored: its tokens when last counted, and when. */
export type Bucket = { tokens: number; at: number }

/** The bucket's tokens at `now`: what it had, refilled since, at most full. */
export function tokensAt(bucket: Bucket | null, now: number): number {
  if (!bucket) return CAPACITY
  const refilled =
    bucket.tokens + (Math.max(0, now - bucket.at) / 1000) * PER_SECOND
  return Math.min(CAPACITY, refilled)
}

/**
 * The bucket after taking `calls` at `now`; null when it hasn't that many
 * (with `debt`, down to -DEBT).
 */
export function take(
  bucket: Bucket | null,
  calls: number,
  now: number,
  debt = false
): Bucket | null {
  const tokens = tokensAt(bucket, now)
  if (tokens - calls < (debt ? -DEBT : 0)) return null
  return { tokens: tokens - calls, at: now }
}

/** Reads a stored bucket; null when missing or malformed (a full one). */
export function bucketOf(data: unknown): Bucket | null {
  if (typeof data !== "object" || data === null) return null
  const { tokens, at } = data as Record<string, unknown>
  return typeof tokens === "number" &&
    Number.isFinite(tokens) &&
    typeof at === "number" &&
    Number.isFinite(at)
    ? { tokens, at }
    : null
}

/**
 * How long a running render goes unasked between two status checks, with
 * no webhook to say it's done: an outfit takes 20–40 s, a makeup or hair
 * step 6–10 s.
 */
export function checkEvery(render: Pick<Render, "tool">): number {
  return render.tool === "clothes" ? 10_000 : 5_000
}

/**
 * How long a render waits after YouCam was busy (429, 5xx) or the bucket
 * was empty, the `busy`th time in a row: 5 s, doubling, at most a minute.
 */
export function busyDelay(busy: number): number {
  return Math.min(60_000, 5_000 * 2 ** Math.max(0, busy - 1))
}

/** A render kept waiting this long by a busy YouCam is given up. */
export const BUSY_LIMIT_MS = 15 * 60_000
