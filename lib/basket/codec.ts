/**
 * How My Pumpkin Basket is kept in the browser's localStorage, and how
 * anything found there is read back. Nothing stored is trusted: an absent,
 * corrupted, oversized, outdated or tampered value reads as what can be
 * salvaged from it, often an empty basket, and never throws.
 */

/** The basket of a visitor who is not signed in: theirs, on this device. */
export const GUEST_KEY = "kostuma.basket"

/**
 * A signed-in visitor's basket as their account last held it: a cache to
 * show at once while the account loads, never merged into anything.
 */
export const ACCOUNT_KEY = "kostuma.basket.account"

/** The format written today. Another version reads as an empty basket. */
export const VERSION = 1

/** More than the collection could ever fill. The Firestore rules agree. */
export const MAX_ITEMS = 200

// A full basket of the longest slugs is about 16 KB; anything longer was not
// written by Kostuma, so it is not even parsed.
const MAX_LENGTH = 32_768

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_SLUG_LENGTH = 64

/** A well-formed costume slug, as Firestore's rules check it too. */
export function isSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_SLUG_LENGTH &&
    SLUG.test(value)
  )
}

/**
 * The costumes in a list read from storage or the account: only slugs of
 * costumes that exist, each once, in the order first added, at most
 * `MAX_ITEMS`.
 */
export function cleanSlugs(
  value: unknown,
  known: ReadonlySet<string>
): string[] {
  if (!Array.isArray(value)) return []
  const slugs = new Set<string>()
  for (const item of value) {
    if (slugs.size === MAX_ITEMS) break
    if (isSlug(item) && known.has(item)) slugs.add(item)
  }
  return [...slugs]
}

/** The stored value as an object of today's format, or nothing. */
function parse(raw: string | null): Record<string, unknown> | undefined {
  if (raw === null || raw.length > MAX_LENGTH) return undefined
  try {
    const value: unknown = JSON.parse(raw)
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      (value as { v?: unknown }).v === VERSION
    ) {
      return value as Record<string, unknown>
    }
  } catch {
    // Not JSON: nothing to salvage.
  }
  return undefined
}

/** A guest basket as stored, read back. */
export function readGuest(
  raw: string | null,
  known: ReadonlySet<string>
): string[] {
  return cleanSlugs(parse(raw)?.slugs, known)
}

export function writeGuest(slugs: readonly string[]) {
  return JSON.stringify({ v: VERSION, slugs })
}

export type AccountCache = { uid: string; slugs: string[] }

/** The cached account basket, or nothing when it is not readable. */
export function readAccount(
  raw: string | null,
  known: ReadonlySet<string>
): AccountCache | undefined {
  const value = parse(raw)
  const uid = value?.uid
  // Firebase uids are 1–128 characters.
  if (typeof uid !== "string" || uid.length === 0 || uid.length > 128) {
    return undefined
  }
  return { uid, slugs: cleanSlugs(value?.slugs, known) }
}

export function writeAccount(uid: string, slugs: readonly string[]) {
  return JSON.stringify({ v: VERSION, uid, slugs })
}
