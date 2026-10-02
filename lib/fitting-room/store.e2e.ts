import "server-only"

import { memoryStore } from "./memory-store"
import type * as Store from "./store"

/**
 * The Fitting Room of the e2e test build only (E2E=1, see next.config.ts):
 * kept in the server's memory, so nothing reaches Firestore or Storage.
 */

const kept = globalThis as typeof globalThis & {
  __e2eFittingRoom?: ReturnType<typeof memoryStore>
}

export const fittingRoomStore: typeof Store.fittingRoomStore = () =>
  (kept.__e2eFittingRoom ??= memoryStore())
