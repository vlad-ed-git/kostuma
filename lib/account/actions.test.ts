// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  user: { uid: "visitor", name: "V", email: "v@example.com" } as {
    uid: string
    name: string
    email: string
  } | null,
  erasePhotos: vi.fn(),
  eraseAccount: vi.fn(),
  deleteSession: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth/session", () => ({
  getUser: async () => mocks.user,
  deleteSession: mocks.deleteSession,
}))
vi.mock("@/lib/account/erase", () => ({
  erasePhotos: mocks.erasePhotos,
  eraseAccount: mocks.eraseAccount,
}))
vi.mock("@/i18n/navigation", () => ({ redirect: mocks.redirect }))

const { deleteAccount, deletePhotos } = await import("./actions")

afterEach(() => {
  vi.clearAllMocks()
  mocks.user = { uid: "visitor", name: "V", email: "v@example.com" }
})

describe("deletePhotos", () => {
  it("deletes the signed-in account's photos", async () => {
    expect(await deletePhotos()).toEqual({ ok: true })
    expect(mocks.erasePhotos).toHaveBeenCalledWith("visitor")
  })

  it("deletes nothing signed out, and says what failed", async () => {
    mocks.user = null
    expect(await deletePhotos()).toEqual({ ok: false, error: "signed_out" })
    expect(mocks.erasePhotos).not.toHaveBeenCalled()
    mocks.user = { uid: "visitor", name: "V", email: "v@example.com" }
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.erasePhotos.mockRejectedValueOnce(new Error("Storage down"))
    expect(await deletePhotos()).toEqual({ ok: false, error: "failed" })
  })
})

describe("deleteAccount", () => {
  it("deletes the account, signs out and goes home in the page's language", async () => {
    await deleteAccount("es")
    expect(mocks.eraseAccount).toHaveBeenCalledWith("visitor")
    expect(mocks.deleteSession).toHaveBeenCalledOnce()
    expect(mocks.redirect).toHaveBeenCalledWith({ href: "/", locale: "es" })
  })

  it("stays signed in when it couldn't delete everything", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.eraseAccount.mockRejectedValueOnce(new Error("Firestore down"))
    expect(await deleteAccount("en")).toEqual({ ok: false, error: "failed" })
    expect(mocks.deleteSession).not.toHaveBeenCalled()
  })

  it("goes home in English for a language it doesn't know", async () => {
    await deleteAccount("xx")
    expect(mocks.redirect).toHaveBeenCalledWith({ href: "/", locale: "en" })
  })
})
