import { describe, expect, it } from "vitest"

import { contentSecurityPolicy, createNonce } from "./csp"

function directives(policy: string) {
  return new Map(
    policy.split("; ").map((directive) => {
      const [name, ...sources] = directive.split(" ")
      return [name, sources] as const
    })
  )
}

const base = { nonce: "abc123", dev: false, https: true }

describe("contentSecurityPolicy", () => {
  it("only runs scripts that carry this request's nonce", () => {
    const scripts = directives(contentSecurityPolicy(base)).get("script-src")
    expect(scripts).toContain("'nonce-abc123'")
    expect(scripts).toContain("'strict-dynamic'")
    expect(scripts).not.toContain("'unsafe-inline'")
    expect(scripts).not.toContain("'unsafe-eval'")
  })

  it("allows eval in development only", () => {
    const dev = directives(contentSecurityPolicy({ ...base, dev: true }))
    expect(dev.get("script-src")).toContain("'unsafe-eval'")
  })

  it("forbids plugins, framing, foreign forms and base tags", () => {
    const policy = directives(contentSecurityPolicy(base))
    expect(policy.get("object-src")).toEqual(["'none'"])
    expect(policy.get("frame-ancestors")).toEqual(["'none'"])
    expect(policy.get("form-action")).toEqual(["'self'"])
    expect(policy.get("base-uri")).toEqual(["'self'"])
  })

  it("upgrades insecure requests only over HTTPS", () => {
    expect(contentSecurityPolicy(base)).toContain("upgrade-insecure-requests")
    expect(contentSecurityPolicy({ ...base, https: false })).not.toContain(
      "upgrade-insecure-requests"
    )
  })

  it("lets a signed-in basket talk to Firestore, and nothing else of Google's", () => {
    const connect = directives(contentSecurityPolicy(base)).get("connect-src")
    expect(connect).toContain("https://firestore.googleapis.com")
    expect(connect).not.toContain("https://*.googleapis.com")
  })

  it("reaches the local Firebase emulators only when told to", () => {
    const local = directives(
      contentSecurityPolicy({ ...base, emulatorHost: "127.0.0.1" })
    )
    expect(local.get("connect-src")).toContain("http://127.0.0.1:9099")
    expect(local.get("connect-src")).toContain("http://127.0.0.1:8085")
    const live = contentSecurityPolicy(base)
    expect(live).not.toContain("9099")
    expect(
      contentSecurityPolicy({ ...base, emulatorHost: "evil.com; script-src *" })
    ).not.toContain("evil.com")
  })

  it("lets Firebase's sign-in frame load from the auth domain", () => {
    const policy = directives(
      contentSecurityPolicy({
        ...base,
        authDomain: "kostuma-73f77.firebaseapp.com",
      })
    )
    expect(policy.get("frame-src")).toContain(
      "https://kostuma-73f77.firebaseapp.com"
    )
  })

  it.each([
    "evil.com; script-src *",
    "https://kostuma.firebaseapp.com",
    "kostuma",
    "",
    "a b.com",
  ])("ignores an auth domain that is not a bare host: %j", (authDomain) => {
    const policy = contentSecurityPolicy({ ...base, authDomain })
    const frames = directives(policy).get("frame-src") ?? []
    expect(frames.every((source) => source.includes("recaptcha"))).toBe(true)
    expect(policy).not.toContain("script-src *")
  })
})

describe("createNonce", () => {
  it("is 128 random bits in base64", () => {
    const nonce = createNonce()
    expect(Buffer.from(nonce, "base64")).toHaveLength(16)
  })

  it("differs every time", () => {
    const nonces = new Set(Array.from({ length: 100 }, createNonce))
    expect(nonces.size).toBe(100)
  })
})
