// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { fromCron } = await import("./cron")

const request = (authorization?: string) =>
  new Request("https://kostuma.vercel.app/api/cron/daily", {
    headers: authorization ? { authorization } : {},
  })

afterEach(() => vi.unstubAllEnvs())

describe("fromCron", () => {
  it("knows Vercel Cron by CRON_SECRET", () => {
    vi.stubEnv("CRON_SECRET", "s3cret")
    expect(fromCron(request("Bearer s3cret"))).toBe(true)
    expect(fromCron(request("Bearer wrong"))).toBe(false)
    expect(fromCron(request("s3cret"))).toBe(false)
    expect(fromCron(request())).toBe(false)
  })

  it("lets nobody in without CRON_SECRET", () => {
    vi.stubEnv("CRON_SECRET", "")
    expect(fromCron(request("Bearer "))).toBe(false)
    expect(fromCron(request("Bearer undefined"))).toBe(false)
  })
})
