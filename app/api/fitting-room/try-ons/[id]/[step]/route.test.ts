// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { TryOn } from "@/lib/fitting-room/try-on"

const mocks = vi.hoisted(() => ({
  viewer: vi.fn(),
  tryOn: vi.fn(),
  stepImage: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth/session", () => ({ getPictureViewer: mocks.viewer }))
vi.mock("@/lib/fitting-room/store", () => ({
  fittingRoomStore: () => ({
    tryOn: mocks.tryOn,
    stepImage: mocks.stepImage,
  }),
}))

const { GET } = await import("./route")

const ID = "0123456789abcdef0123456789abcdef"
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])

/** A try-on dressed in Beetlejuice: the outfit, the dressed face, makeup. */
const tryOn = {
  id: ID,
  slug: "beetlejuice",
  steps: [
    { render: { tool: "clothes" } },
    { render: { tool: "clothes" } },
    { render: { tool: "makeup" } },
    { render: { tool: "makeup" } },
  ],
} as unknown as TryOn

const get = (step: string, query = "") =>
  GET(
    new Request(
      `https://kostuma.vercel.app/api/fitting-room/try-ons/${ID}/${step}${query}`
    ),
    { params: Promise.resolve({ id: ID, step }) }
  )

beforeEach(() => {
  vi.resetAllMocks()
  mocks.viewer.mockResolvedValue({ uid: "u1" })
  mocks.tryOn.mockResolvedValue(tryOn)
  mocks.stepImage.mockResolvedValue(JPEG)
})

describe("a try-on's picture", () => {
  it("is shown to its owner, in the page", async () => {
    const response = await get("3", "?v=1")
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("image/jpeg")
    expect(response.headers.get("content-disposition")).toBe("inline")
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(JPEG)
    expect(mocks.stepImage).toHaveBeenCalledWith("u1", ID, 3)
    // Shown, it needs no try-on read.
    expect(mocks.tryOn).not.toHaveBeenCalled()
  })

  it("comes as the same JPEG, a file named after the costume and the step, to save", async () => {
    for (const [step, name] of [
      ["0", "kostuma-beetlejuice-outfit.jpg"],
      ["2", "kostuma-beetlejuice-step-1.jpg"],
      ["3", "kostuma-beetlejuice-step-2.jpg"],
    ]) {
      const response = await get(step, "?v=1&download=1")
      expect(response.status).toBe(200)
      expect(response.headers.get("content-disposition")).toBe(
        `attachment; filename="${name}"`
      )
      expect(response.headers.get("cache-control")).toBe(
        "private, max-age=31536000, immutable"
      )
      expect(new Uint8Array(await response.arrayBuffer())).toEqual(JPEG)
    }
    expect(mocks.tryOn).toHaveBeenCalledWith("u1", ID)
  })

  it("is nobody else's: signed out, or another account's try-on", async () => {
    mocks.viewer.mockResolvedValue(null)
    expect((await get("3", "?download=1")).status).toBe(401)

    mocks.viewer.mockResolvedValue({ uid: "u2" })
    mocks.tryOn.mockResolvedValue(null)
    mocks.stepImage.mockResolvedValue(null)
    expect((await get("3", "?download=1")).status).toBe(404)
    expect((await get("3")).status).toBe(404)
  })

  it("never asks the store about a malformed address", async () => {
    const response = await GET(
      new Request("https://kostuma.vercel.app/api/fitting-room/try-ons/x/3"),
      { params: Promise.resolve({ id: "../x", step: "3" }) }
    )
    expect(response.status).toBe(404)
    expect(mocks.stepImage).not.toHaveBeenCalled()
  })

  it("says so when the picture can't be read", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.tryOn.mockRejectedValue(new Error("Firestore is down"))
    expect((await get("3", "?download=1")).status).toBe(503)
  })
})
