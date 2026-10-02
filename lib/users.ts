import "server-only"

import { FieldValue, Timestamp } from "firebase-admin/firestore"

import { adminDb } from "@/lib/firebase/admin"
import type { Locale } from "@/i18n/routing"

/** Profiles, one per account, keyed by the account's uid. */
const users = "users"

/** Free try-ons in the Fitting Room for every new account (owner). */
export const FREE_TRY_ONS = 2

export type NewProfile = {
  uid: string
  name: string
  email: string
  locale: Locale
}

export type Profile = {
  name: string
  email: string
  /** Try-ons left in the Fitting Room. */
  credits: number
  createdAt: Date | null
}

/**
 * Creates the profile of a new account, whose owner has agreed to the
 * Terms of service and the Privacy policy. Fails if one already exists: a
 * profile is never overwritten.
 */
export async function createProfile({ uid, name, email, locale }: NewProfile) {
  await adminDb().collection(users).doc(uid).create({
    name,
    email,
    locale,
    credits: FREE_TRY_ONS,
    createdAt: FieldValue.serverTimestamp(),
    termsAcceptedAt: FieldValue.serverTimestamp(),
  })
}

/** An account's profile, or null when it has none. */
export async function getProfile(uid: string): Promise<Profile | null> {
  const snapshot = await adminDb().collection(users).doc(uid).get()
  if (!snapshot.exists) return null
  const data = snapshot.data() ?? {}
  return {
    name: typeof data.name === "string" ? data.name : "",
    email: typeof data.email === "string" ? data.email : "",
    credits: typeof data.credits === "number" ? data.credits : 0,
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  }
}

/** Whether an account has its profile (it has agreed to the terms). */
export async function hasProfile(uid: string) {
  return (await adminDb().collection(users).doc(uid).get()).exists
}
