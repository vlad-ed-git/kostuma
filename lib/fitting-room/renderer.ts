import "server-only"

import { fakeProvider } from "./fake-provider"
import type { RenderProvider } from "./provider"
import { youcamProvider } from "./youcam"

/**
 * Who renders, by TRY_ON_PROVIDER (.env.example): "youcam" (real renders,
 * paid in units), or "fake" (free, local: lib/fitting-room/fake-provider.ts).
 * Unset, it's the fake off Vercel and nobody on it: the Fitting Room is
 * closed until it's set. Null when closed.
 */
export function renderProvider(): RenderProvider | null {
  const choice = process.env.TRY_ON_PROVIDER
  if (choice === "youcam") {
    const key = process.env.YOUCAM_API_GENERATED_KEY
    if (key) return youcamProvider(key)
    console.error(
      "TRY_ON_PROVIDER is youcam, but YOUCAM_API_GENERATED_KEY is not set."
    )
    return null
  }
  if (choice === "fake" || (!choice && !process.env.VERCEL)) return fakeProvider
  return null
}
