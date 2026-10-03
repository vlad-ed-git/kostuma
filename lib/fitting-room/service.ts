import "server-only"

// By their @/ names: the e2e build swaps these for its stand-ins.
import { garmentImage } from "@/lib/fitting-room/garment"
import { renderProvider } from "@/lib/fitting-room/renderer"
import { fittingRoomStore } from "@/lib/fitting-room/store"

import { type Allowance, allowanceOf } from "./free-costume"
import type { Deps } from "./steps"

/** What the Fitting Room runs on; null while it's closed (no provider). */
export function fittingRoom(): Deps | null {
  const provider = renderProvider()
  if (!provider) return null
  return { store: fittingRoomStore(), provider, garment: garmentImage }
}

/**
 * The account's free costume (free-costume.ts), as a page shows it; null
 * when that can't be told (the Fitting Room closed, or its store failing):
 * starting a try-on decides anyway.
 */
export async function allowanceFor(uid: string): Promise<Allowance | null> {
  const deps = fittingRoom()
  if (!deps) return null
  try {
    const [room, tryOns] = await Promise.all([
      deps.store.room(uid),
      deps.store.tryOns(uid),
    ])
    return allowanceOf(tryOns, room.failedTries, deps.provider.name)
  } catch (error) {
    console.error("Could not read an account's free costume.", error)
    return null
  }
}
