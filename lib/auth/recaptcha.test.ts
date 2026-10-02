// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { verifyRecaptcha } from "./recaptcha"

vi.mock("server-only", () => ({}))

const answer = (body: unknown, ok = true) =>
  vi.fn().mockResolvedValue({ ok, json: async () => body })

beforeEach(() => {
  vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret")
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("verifyRecaptcha", () => {
  it("passes a token Google passes, sending the secret", async () => {
    const fetch = answer({ success: true })
    vi.stubGlobal("fetch", fetch)
    expect(await verifyRecaptcha("token")).toBe(true)
    const body = fetch.mock.calls[0][1].body as URLSearchParams
    expect(body.get("secret")).toBe("secret")
    expect(body.get("response")).toBe("token")
  })

  it.each([
    ["refused", answer({ success: false })],
    ["an odd answer", answer({ success: "true" })],
    ["an error status", answer({ success: true }, false)],
    ["no answer (fails closed)", vi.fn().mockRejectedValue(new Error("down"))],
  ])("fails a token on %s", async (_, fetch) => {
    vi.stubGlobal("fetch", fetch)
    expect(await verifyRecaptcha("token")).toBe(false)
  })

  it("refuses to run without its secret", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "")
    await expect(verifyRecaptcha("token")).rejects.toThrow(
      "RECAPTCHA_SECRET_KEY"
    )
  })
})
