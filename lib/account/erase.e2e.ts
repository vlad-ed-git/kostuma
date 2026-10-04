import "server-only"

// By its @/ name: the e2e build's stand-in (memory).
import { fittingRoomStore } from "@/lib/fitting-room/store"

import type * as Erase from "./erase"

/**
 * Deleting an account's data in the e2e test build only (E2E=1, see
 * next.config.ts): its Fitting Room, kept in the server's memory. Nothing
 * else of it is kept anywhere the tests could reach.
 */

export const erasePhotos: typeof Erase.erasePhotos = async (uid) => {
  await fittingRoomStore().erase(uid)
}

export const eraseAccount: typeof Erase.eraseAccount = async (uid) => {
  await fittingRoomStore().erase(uid, { account: true })
}
