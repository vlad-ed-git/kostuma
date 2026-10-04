// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

import robots from "./robots"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("robots.txt", () => {
  it("opens every page but the API, and points at the sitemap", () => {
    vi.stubEnv("SITE_URL", "")
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: "https://kostuma.vercel.app/sitemap.xml",
    })
  })
})
