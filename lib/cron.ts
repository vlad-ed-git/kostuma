import "server-only"

import { createHash, timingSafeEqual } from "node:crypto"

/**
 * Whether a request is Vercel Cron's: it sends `Authorization: Bearer
 * <CRON_SECRET>` (vercel.json `crons`). Without CRON_SECRET set, no request
 * is: the jobs never run for anyone else.
 */
export function fromCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = request.headers.get("authorization") ?? ""
  // Compared as hashes: the same length, in constant time.
  const digest = (value: string) => createHash("sha256").update(value).digest()
  return timingSafeEqual(digest(given), digest(`Bearer ${secret}`))
}
