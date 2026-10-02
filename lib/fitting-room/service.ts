import "server-only"

// By their @/ names: the e2e build swaps these for its stand-ins.
import { garmentImage } from "@/lib/fitting-room/garment"
import { renderProvider } from "@/lib/fitting-room/renderer"
import { fittingRoomStore } from "@/lib/fitting-room/store"

import type { Deps } from "./steps"

/** What the Fitting Room runs on; null while it's closed (no provider). */
export function fittingRoom(): Deps | null {
  const provider = renderProvider()
  if (!provider) return null
  return { store: fittingRoomStore(), provider, garment: garmentImage }
}
