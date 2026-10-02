// @vitest-environment node
import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { visitorFrom } = await import("./visitor")

const iPhone =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
const macChrome =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
const androidTablet =
  "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"

describe("visitorFrom", () => {
  it("reads the place from Vercel's headers and the device from the user agent", () => {
    expect(
      visitorFrom(
        new Headers({
          "x-vercel-ip-country": "BR",
          "x-vercel-ip-country-region": "SP",
          "x-vercel-ip-city": "S%C3%A3o%20Paulo",
          "x-vercel-ip-timezone": "America/Sao_Paulo",
          "user-agent": iPhone,
        })
      )
    ).toEqual({
      country: "BR",
      region: "SP",
      city: "São Paulo",
      timeZone: "America/Sao_Paulo",
      device: "mobile",
      os: "iOS",
      browser: "Mobile Safari",
    })
  })

  it("calls a browser without a device type a desktop", () => {
    expect(visitorFrom(new Headers({ "user-agent": macChrome }))).toMatchObject(
      { device: "desktop", os: "Mac OS", browser: "Chrome" }
    )
    expect(
      visitorFrom(new Headers({ "user-agent": androidTablet }))
    ).toMatchObject({ device: "tablet", os: "Android" })
  })

  it("knows nothing it isn't told (localhost has no place)", () => {
    expect(visitorFrom(new Headers())).toEqual({
      country: null,
      region: null,
      city: null,
      timeZone: null,
      device: null,
      os: null,
      browser: null,
    })
  })

  it("keeps nothing malformed", () => {
    expect(
      visitorFrom(
        new Headers({
          "x-vercel-ip-country": "United States",
          "x-vercel-ip-country-region": "<script>",
          "x-vercel-ip-city": "%E0%A4%A",
          "x-vercel-ip-timezone": "Mars/Olympus_Mons",
        })
      )
    ).toMatchObject({ country: null, region: null, city: null, timeZone: null })
    expect(
      visitorFrom(new Headers({ "x-vercel-ip-city": "x".repeat(101) })).city
    ).toBeNull()
    expect(
      visitorFrom(new Headers({ "x-vercel-ip-city": "Bad%0ACity" })).city
    ).toBeNull()
  })
})
