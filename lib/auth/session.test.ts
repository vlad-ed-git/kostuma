// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const mocks = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  set: vi.fn(),
  remove: vi.fn(),
  verifySessionCookie: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      mocks.cookies.has(name) ? { value: mocks.cookies.get(name) } : undefined,
    set: mocks.set,
    delete: mocks.remove,
  }),
}))
vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: () => ({ verifySessionCookie: mocks.verifySessionCookie }),
}))
// `cache` is per request in Next.js; per call here.
vi.mock("react", async (actual) => ({
  ...(await actual<typeof import("react")>()),
  cache: (fn: unknown) => fn,
}))

const { deleteSession, getPictureViewer, getUser, saveSession } =
  await import("./session")

afterEach(() => {
  mocks.cookies.clear()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe("getUser", () => {
  it("is nobody without a session cookie, asking Firebase nothing", async () => {
    expect(await getUser()).toBeNull()
    expect(mocks.verifySessionCookie).not.toHaveBeenCalled()
  })

  it("is the session's account, checked for revocation", async () => {
    mocks.cookies.set("session", "cookie")
    mocks.verifySessionCookie.mockResolvedValue({
      uid: "u1",
      name: "Carrie White",
      email: "carrie@example.com",
      email_verified: true,
    })
    expect(await getUser()).toEqual({
      uid: "u1",
      name: "Carrie White",
      email: "carrie@example.com",
      emailVerified: true,
    })
    expect(mocks.verifySessionCookie).toHaveBeenCalledWith("cookie", true)
  })

  it("lets the pictures' routes skip the revocation round trip", async () => {
    mocks.cookies.set("session", "cookie")
    mocks.verifySessionCookie.mockResolvedValue({ uid: "u1" })
    expect(await getPictureViewer()).toMatchObject({ uid: "u1" })
    expect(mocks.verifySessionCookie).toHaveBeenCalledWith("cookie", false)
  })

  it("never takes an email for verified unless Firebase says so", async () => {
    mocks.cookies.set("session", "cookie")
    mocks.verifySessionCookie.mockResolvedValue({ uid: "u1" })
    expect(await getUser()).toMatchObject({ emailVerified: false })
  })

  it("is nobody once the session has ended, quietly", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.cookies.set("session", "cookie")
    for (const code of [
      "auth/session-cookie-expired",
      "auth/session-cookie-revoked",
      "auth/user-disabled",
    ]) {
      mocks.verifySessionCookie.mockRejectedValue({ code })
      expect(await getUser()).toBeNull()
    }
    expect(log).not.toHaveBeenCalled()
  })

  it("is nobody when Firebase fails, and tells the developers", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.cookies.set("session", "cookie")
    mocks.verifySessionCookie.mockRejectedValue(new Error("network"))
    expect(await getUser()).toBeNull()
    expect(log).toHaveBeenCalled()
  })
})

describe("the session cookie", () => {
  it("is httpOnly, same-site and kept 14 days", async () => {
    await saveSession("cookie")
    expect(mocks.set).toHaveBeenCalledWith("session", "cookie", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 24 * 60 * 60,
    })
    await deleteSession()
    expect(mocks.remove).toHaveBeenCalledWith("session")
  })
})
