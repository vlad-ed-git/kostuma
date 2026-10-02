import type * as Firestore from "./firestore"
import { applyChange, type RemoteBasket, type RemoteState } from "./remote"

/**
 * The account's basket in the e2e test build only (E2E=1, see
 * next.config.ts): kept in this browser's localStorage under its own key, so
 * a signed-in test sees the account follow other tabs live, as Firestore
 * would, without Firebase. The real one is tested on the emulators.
 */

const key = "e2e.account-basket"

function read(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export const BASKETS: typeof Firestore.BASKETS = "baskets"

export const firestoreBasket: typeof Firestore.firestoreBasket = () => {
  const watchers = new Set<(state: RemoteState) => void>()
  const tell = () => {
    for (const next of watchers) next({ slugs: read(), confirmed: true })
  }
  const remote: RemoteBasket = {
    watch(next) {
      watchers.add(next)
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) next({ slugs: read(), confirmed: true })
      }
      window.addEventListener("storage", onStorage)
      queueMicrotask(() => next({ slugs: read(), confirmed: true }))
      return () => {
        watchers.delete(next)
        window.removeEventListener("storage", onStorage)
      }
    },
    async apply(change) {
      localStorage.setItem(key, JSON.stringify(applyChange(read(), change)))
      tell()
    },
  }
  return remote
}

export const openAccountBasket: typeof Firestore.openAccountBasket = async () =>
  firestoreBasket(undefined as never, "e2e-visitor")
