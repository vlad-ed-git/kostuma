import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore"

import type { Change, RemoteBasket } from "./remote"

/** Where a signed-in visitor's basket lives: one document per account. */
export const BASKETS = "baskets"

/**
 * A signed-in visitor's My Pumpkin Basket in Firestore, `baskets/{uid}`:
 * `{ slugs: string[], updatedAt }`, the costumes in the order added.
 *
 * Every change is a field transform the server applies to whatever the
 * basket holds when it arrives, so changes from several tabs and devices
 * never overwrite each other: adding unions, removing removes, clearing
 * empties. firestore.rules lets each write add at most one costume, so a
 * basket of several costumes joins as one write each.
 */
export function firestoreBasket(db: Firestore, uid: string): RemoteBasket {
  const basket = doc(db, BASKETS, uid)
  const write = (slugs: unknown) =>
    setDoc(basket, { slugs, updatedAt: serverTimestamp() }, { merge: true })

  return {
    watch(next, fail) {
      return onSnapshot(
        basket,
        // Metadata changes too: the moment the server confirms this tab's
        // own change is the moment it is worth caching.
        { includeMetadataChanges: true },
        (snapshot) => {
          const { fromCache, hasPendingWrites } = snapshot.metadata
          // Offline before the server answered: not knowing is not empty.
          if (fromCache && !snapshot.exists()) return
          next({
            slugs: snapshot.get("slugs") ?? [],
            confirmed: !fromCache && !hasPendingWrites,
          })
        },
        fail
      )
    },
    async apply(change: Change) {
      switch (change.type) {
        case "add":
          await Promise.all(change.slugs.map((slug) => write(arrayUnion(slug))))
          return
        case "remove":
          await write(arrayRemove(change.slug))
          return
        case "clear":
          await write([])
          return
      }
    },
  }
}

/**
 * The basket of the account this tab is signed in to. The browser must be
 * signed in to Firebase as that account (feat/auth signs it in): the rules
 * let each account reach only its own basket.
 */
export async function openAccountBasket(uid: string): Promise<RemoteBasket> {
  const { clientAuth, clientDb } = await import("@/lib/firebase/client")
  const auth = clientAuth()
  await auth.authStateReady()
  if (auth.currentUser?.uid !== uid) {
    throw new Error(
      "This browser is not signed in to Firebase as the session's account."
    )
  }
  return firestoreBasket(clientDb(), uid)
}
