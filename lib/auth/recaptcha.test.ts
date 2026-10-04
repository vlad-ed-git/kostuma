// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { recaptchaHosts, verifyRecaptcha } from "./recaptcha"

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
    const fetch = answer({ success: true, hostname: "kostuma.vercel.app" })
    vi.stubGlobal("fetch", fetch)
    expect(await verifyRecaptcha("token")).toBe(true)
    const body = fetch.mock.calls[0][1].body as URLSearchParams
    expect(body.get("secret")).toBe("secret")
    expect(body.get("response")).toBe("token")
  })

  it.each([
    ["refused", answer({ success: false, hostname: "kostuma.vercel.app" })],
    ["an odd answer", answer({ success: "true" })],
    [
      "an error status",
      answer({ success: true, hostname: "kostuma.vercel.app" }, false),
    ],
    ["no answer (fails closed)", vi.fn().mockRejectedValue(new Error("down"))],
    [
      "a pass earned on another site",
      answer({ success: true, hostname: "evil.example" }),
    ],
    ["a pass naming no site", answer({ success: true })],
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

describe("recaptchaHosts", () => {
  it("takes Kostuma's host only in production", () => {
    expect([
      ...recaptchaHosts({
        VERCEL_ENV: "production",
        VERCEL_URL: "kostuma-abc.vercel.app",
      }),
    ]).toEqual(["kostuma.vercel.app"])
  })

  it("takes a preview's own host, and localhost, away from production", () => {
    const hosts = recaptchaHosts({
      VERCEL_ENV: "preview",
      VERCEL_URL: "kostuma-abc.vercel.app",
      VERCEL_BRANCH_URL: "kostuma-git-x.vercel.app",
    })
    for (const host of [
      "kostuma.vercel.app",
      "kostuma-abc.vercel.app",
      "kostuma-git-x.vercel.app",
      "localhost",
    ])
      expect(hosts.has(host), host).toBe(true)
    expect(hosts.has("testkey.google.com")).toBe(false)
  })

  it("takes Google's test key only in the test builds", () => {
    expect(recaptchaHosts({ E2E: "1" }).has("testkey.google.com")).toBe(true)
    expect(recaptchaHosts({ E2E: "emulators" }).has("testkey.google.com")).toBe(
      true
    )
    expect(recaptchaHosts({}).has("testkey.google.com")).toBe(false)
  })
})
