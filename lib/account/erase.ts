import "server-only"

import { adminAuth, adminDb } from "@/lib/firebase/admin"
// By their @/ names: the e2e build swaps these for its stand-ins.
import { renderProvider } from "@/lib/fitting-room/renderer"
import { fittingRoomStore } from "@/lib/fitting-room/store"
import { ACCOUNT_LIMITS } from "@/lib/limits"
import { forgetSender } from "@/lib/rate-limit"

/**
 * Deleting what an account keeps, from its account page (todo SEC-04): its
 * photos and pictures, or the whole account. The Privacy policy promises
 * both.
 */

/** Deletes YouCam's tasks the try-ons still held, and the notes of them. */
async function letGo(tasks: readonly string[]) {
  const provider = renderProvider()
  const store = fittingRoomStore()
  await Promise.all(
    tasks.map(async (task) => {
      await provider?.discard(task)
      await store.forgetTask(task)
    })
  )
}

/**
 * Deletes the account's photos, the pictures made from them and its
 * try-ons. Its free costume stays as it is (lib/fitting-room/free-costume.ts).
 */
export async function erasePhotos(uid: string) {
  await letGo(await fittingRoomStore().erase(uid))
}

/**
 * Deletes the account and everything kept with it: the Fitting Room's
 * photos, pictures, try-ons and free costume, My Pumpkin Basket, its place
 * on Kostuma Pro's waitlist, its messages, its rate counts, its profile,
 * then the account itself (signed out everywhere).
 */
export async function eraseAccount(uid: string) {
  await letGo(await fittingRoomStore().erase(uid, { account: true }))
  const db = adminDb()
  const messages = await db.collection("feedback").where("uid", "==", uid).get()
  await Promise.all([
    db.collection("baskets").doc(uid).delete(),
    db.collection("waitlist").doc(uid).delete(),
    ...messages.docs.map((doc) => doc.ref.delete()),
    forgetSender(ACCOUNT_LIMITS, `account:${uid}`),
  ])
  await db.collection("users").doc(uid).delete()
  try {
    await adminAuth().deleteUser(uid)
  } catch (error) {
    // Gone already: what was asked is done.
    if ((error as { code?: unknown }).code !== "auth/user-not-found")
      throw error
  }
}
