import { afterEach, describe, expect, it, vi } from "vitest"

import { isHeic, readPhoto } from "./browser-photo"

afterEach(() => vi.unstubAllGlobals())

describe("isHeic", () => {
  it("knows an iPhone's photo by its type or its name", () => {
    expect(isHeic({ name: "IMG_0001.HEIC", type: "" })).toBe(true)
    expect(isHeic({ name: "photo", type: "image/heif" })).toBe(true)
    expect(isHeic({ name: "photo", type: "image/heic-sequence" })).toBe(true)
    expect(isHeic({ name: "photo.jpg", type: "image/jpeg" })).toBe(false)
  })
})

describe("readPhoto", () => {
  it("names a HEIC photo this browser can't open, and any other file it can't", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new DOMException("no decoder"))
    )
    const heic = new File([new Uint8Array([1])], "IMG_0001.heic", {
      type: "image/heic",
    })
    expect(await readPhoto("face", heic)).toEqual({ problem: "heic" })
    const other = new File([new Uint8Array([1])], "notes.txt", {
      type: "text/plain",
    })
    expect(await readPhoto("face", other)).toEqual({ problem: "unreadable" })
  })
})
