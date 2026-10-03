import "server-only"

import { FieldValue, Timestamp } from "firebase-admin/firestore"

import { adminDb } from "@/lib/firebase/admin"
import type { Visitor } from "@/lib/visitor"
import type { Locale } from "@/i18n/routing"

/** Profiles, one per account, keyed by the account's uid. */
const users = "users"

export type NewProfile = {
  uid: string
  name: string
  email: string
  emailVerified: boolean
  /** The account's picture (Google's), if it has one. */
  photoURL: string | null
  /** How the account was made: "password" or "google.com". */
  provider: string
  /** The site's language when it was made. */
  locale: Locale
  /** Where, and on what, it was made (analytics). */
  signUp: Visitor
}

export type Profile = {
  name: string
  email: string
  createdAt: Date | null
}

/**
 * Creates the profile of a new account, whose owner has agreed to the
 * Terms of service and the Privacy policy. Fails if one already exists: a
 * profile is never overwritten. Its sign-ins are counted from the first
 * session on (`recordSignIn`).
 */
export async function createProfile(profile: NewProfile) {
  await adminDb().collection(users).doc(profile.uid).create({
    uid: profile.uid,
    name: profile.name,
    email: profile.email,
    emailVerified: profile.emailVerified,
    photoURL: profile.photoURL,
    provider: profile.provider,
    locale: profile.locale,
    createdAt: FieldValue.serverTimestamp(),
    termsAcceptedAt: FieldValue.serverTimestamp(),
    lastSignInAt: null,
    signIns: 0,
    signUp: profile.signUp,
  })
}

/** Notes a session started on the account: when, and how many so far. */
export async function recordSignIn(uid: string) {
  await adminDb()
    .collection(users)
    .doc(uid)
    .update({
      lastSignInAt: FieldValue.serverTimestamp(),
      signIns: FieldValue.increment(1),
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
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  }
}

/** Whether an account has its profile (it has agreed to the terms). */
export async function hasProfile(uid: string) {
  return (await adminDb().collection(users).doc(uid).get()).exists
}
