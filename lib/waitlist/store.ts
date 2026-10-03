import "server-only"

import { FieldValue } from "firebase-admin/firestore"

import type { Locale } from "@/i18n/routing"
import { adminDb } from "@/lib/firebase/admin"

import type { WaitlistSource } from "./schema"

/**
 * `waitlist/{uid}`: the accounts waiting for Kostuma Pro, one entry each,
 * read by the owner in the Firebase console. Through the Admin SDK only
 * (firestore.rules closes it to browsers).
 */
export type WaitlistEntry = {
  uid: string
  /** Where to reach them: the account's email, until they give another. */
  email: string
  /** The account's email when it joined. */
  accountEmail: string
  /** The site's language when it joined. */
  locale: Locale
  /** Where "Get Kostuma Pro" was pressed first. */
  source: WaitlistSource
}

const entryRef = (uid: string) => adminDb().collection("waitlist").doc(uid)

const emailOf = (data: Record<string, unknown>) =>
  typeof data.email === "string" ? data.email : ""

/**
 * Puts the account on the waitlist, once: when it is on already, the entry
 * stays as it is (its first date and email). The email to reach it at.
 */
export async function addToWaitlist(entry: WaitlistEntry): Promise<string> {
  const ref = entryRef(entry.uid)
  return adminDb().runTransaction(async (transaction) => {
    const existing = (await transaction.get(ref)).data()
    if (existing) return emailOf(existing)
    transaction.create(ref, {
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return entry.email
  })
}

/**
 * Makes `entry.email` the one to reach the account at, when it differs
 * (an account not on the waitlist joins with it). The email kept.
 */
export async function changeWaitlistEmail(
  entry: WaitlistEntry
): Promise<string> {
  const ref = entryRef(entry.uid)
  return adminDb().runTransaction(async (transaction) => {
    const existing = (await transaction.get(ref)).data()
    if (!existing) {
      transaction.create(ref, {
        ...entry,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    } else if (emailOf(existing) !== entry.email) {
      transaction.update(ref, {
        email: entry.email,
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
    return entry.email
  })
}
