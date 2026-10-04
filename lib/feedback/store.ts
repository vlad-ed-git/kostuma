import "server-only"

import { FieldValue } from "firebase-admin/firestore"

import type { Locale } from "@/i18n/routing"
import { adminDb } from "@/lib/firebase/admin"
import type { Visitor } from "@/lib/visitor"

import type { FeedbackKind } from "./schema"

/** A message sent through the feedback form, as kept. */
export type Feedback = {
  kind: FeedbackKind
  /** As typed, trimmed. */
  message: string
  /** Only when the sender wants a reply. */
  email: string | null
  /** The account that sent it, when signed in. */
  uid: string | null
  /** The site's language as it was sent. */
  locale: Locale
} & Pick<Visitor, "device" | "os" | "browser">

/**
 * `feedback/{id}`: read by the owner in the Firebase console, through the
 * Admin SDK only (firestore.rules closes it to browsers).
 */
export async function saveFeedback(feedback: Feedback) {
  await adminDb()
    .collection("feedback")
    .add({ ...feedback, createdAt: FieldValue.serverTimestamp() })
}
