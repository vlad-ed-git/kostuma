import "server-only"

import type { RenderProvider } from "./provider"
import { youcamProvider } from "./youcam"

/**
 * Who renders: YouCam, always, localhost included (owner, 2026-10-03:
 * "nothing should be faked on localhost"). The free fake exists only for
 * the automated tests (renderer.e2e.ts, the e2e build). On Vercel the
 * Fitting Room stays closed until TRY_ON_PROVIDER is "youcam" (nothing is
 * paid for yet). Null when closed.
 */
export function renderProvider(): RenderProvider | null {
  if (process.env.VERCEL && process.env.TRY_ON_PROVIDER !== "youcam")
    return null
  const key = process.env.YOUCAM_API_GENERATED_KEY
  if (key) return youcamProvider(key)
  console.error(
    "The Fitting Room is closed: YOUCAM_API_GENERATED_KEY is not set."
  )
  return null
}
