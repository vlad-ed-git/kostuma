import "server-only"

import type * as Store from "./store"

/**
 * The waitlist of the e2e test build only (E2E=1, see next.config.ts): kept
 * in the server's memory, so nothing reaches Firestore. Reloading a page
 * finds an entry made before, as with Firestore.
 */

export type WaitlistEntry = Store.WaitlistEntry

const kept = globalThis as typeof globalThis & {
  __e2eWaitlist?: Map<string, WaitlistEntry>
}
const entries = (kept.__e2eWaitlist ??= new Map())

export const addToWaitlist: typeof Store.addToWaitlist = async (entry) => {
  const existing = entries.get(entry.uid)
  if (existing) return existing.email
  entries.set(entry.uid, { ...entry })
  return entry.email
}

export const changeWaitlistEmail: typeof Store.changeWaitlistEmail = async (
  entry
) => {
  const existing = entries.get(entry.uid)
  entries.set(entry.uid, existing ? { ...existing, email: entry.email } : entry)
  return entry.email
}
