import "server-only"

import { createHash } from "node:crypto"
import { Timestamp } from "firebase-admin/firestore"

import { adminDb } from "@/lib/firebase/admin"

/**
 * How often something may be done: at most `max` times per `windowMs`,
 * counted from the first time in a window. `name` keeps each limit's counts
 * apart.
 */
export type Limit = { name: string; max: number; windowMs: number }

/**
 * `rateLimits/{id}`: `{ count, expiresAt }`, one per limit and sender. The
 * id is a SHA-256 hash, so neither an IP address nor an account's uid is
 * kept as it is. When `expiresAt` passes, the entry is spent: the next use
 * starts a new window, `sweepRateLimits` deletes it, and so does Firestore's
 * TTL policy on `rateLimits.expiresAt` where it is turned on.
 */
const rateLimits = "rateLimits"

/**
 * Counts one more use of `limit` by `sender` (an account, or a connection's
 * address) and answers whether it was allowed. A use over the limit isn't
 * counted.
 */
export async function withinLimit(
  limit: Limit,
  sender: string,
  now = Date.now()
): Promise<boolean> {
  const ref = adminDb().collection(rateLimits).doc(idOf(limit, sender))

  return adminDb().runTransaction(async (transaction) => {
    const data = (await transaction.get(ref)).data()
    const expiresAt =
      data?.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : 0
    const current = expiresAt > now
    const count = current && typeof data?.count === "number" ? data.count : 0
    if (count >= limit.max) return false

    transaction.set(ref, {
      count: count + 1,
      expiresAt: current
        ? data!.expiresAt
        : Timestamp.fromMillis(now + limit.windowMs),
    })
    return true
  })
}

/** An entry's id: the limit and its sender, hashed. */
const idOf = (limit: Limit, sender: string) =>
  createHash("sha256").update(`${limit.name}:${sender}`).digest("hex")

/** Deletes a sender's counts for these limits (an account deleted). */
export async function forgetSender(limits: readonly Limit[], sender: string) {
  await Promise.all(
    limits.map((limit) =>
      adminDb().collection(rateLimits).doc(idOf(limit, sender)).delete()
    )
  )
}

/** Deletes spent entries, a batch at a time. */
export async function sweepRateLimits(now = Date.now()) {
  const spent = await adminDb()
    .collection(rateLimits)
    .where("expiresAt", "<=", Timestamp.fromMillis(now))
    .limit(100)
    .get()
  if (spent.empty) return
  const batch = adminDb().batch()
  for (const entry of spent.docs) batch.delete(entry.ref)
  await batch.commit()
}

/**
 * The address a request comes from, as Vercel passes it on (it sets both
 * headers itself, so a visitor cannot forge them there). Null without
 * either, as on localhost.
 */
export function addressOf(headers: Headers): string | null {
  const address =
    headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]
  return address?.trim() || null
}
