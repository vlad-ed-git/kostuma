// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

import { PRODUCTION_URL, siteUrl } from "./site"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("siteUrl", () => {
  it("is the production domain unless told otherwise", () => {
    vi.stubEnv("SITE_URL", "")
    expect(siteUrl().href).toBe(`${PRODUCTION_URL}/`)
  })

  it("is SITE_URL when set: a test build serving itself", () => {
    vi.stubEnv("SITE_URL", "http://localhost:3100")
    expect(siteUrl().href).toBe("http://localhost:3100/")
  })

  it("keeps to the production domain when SITE_URL isn't an address", () => {
    vi.stubEnv("SITE_URL", "kostuma dot app")
    expect(siteUrl().href).toBe(`${PRODUCTION_URL}/`)
  })
})
