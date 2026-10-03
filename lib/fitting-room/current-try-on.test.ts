// @vitest-environment node
import { describe, expect, it } from "vitest"

import type { Photo } from "@/lib/catalog/types"

import { currentTryOn } from "./current-try-on"
import type { Room, TryOn } from "./try-on"

const shown = "https://example.com/costumes%2Fpearl.1a2b3c4d5e.webp"
const garment = "https://example.com/costumes%2Fpearl-costume.5e4d3c2b1a.webp"
const photo = (url: string): Photo => ({
  file: "pearl.png",
  url,
  width: 1000,
  height: 1500,
})

function tryOn(
  id: string,
  {
    slug = "pearl",
    face = "x",
    body = "y" as string | null,
    renderer = "youcam" as TryOn["renderer"],
    made = shown as string | null,
    /** Recorded before garments were: no `garment` at all. */
    legacy = false,
  } = {}
): TryOn {
  return {
    id,
    slug,
    renderer,
    face,
    body,
    ...(legacy ? {} : { garment: made }),
    version: 2,
    status: "done",
    steps: [],
    failure: null,
    createdAt: 0,
    updatedAt: 0,
  }
}

const room = (face: string | null, body: string | null): Room => ({
  face: face ? { id: face, width: 900, height: 1200, skin: "#C68642" } : null,
  body: body ? { id: body, width: 1000, height: 1500 } : null,
  failedTries: 0,
})

const pearl = {
  costume: { slug: "pearl", images: [photo(shown)] },
  renderer: "youcam" as const,
  allMakeup: false,
}

describe("currentTryOn", () => {
  it("shows the try-on made with the photos in use, though older", () => {
    // Newest first: photos y2 replaced y, then y was chosen again.
    const tryOns = [tryOn("new", { body: "y2" }), tryOn("old")]
    expect(currentTryOn(tryOns, { ...pearl, room: room("x", "y") })?.id).toBe(
      "old"
    )
  })

  it("shows the newest when the photos in use made none", () => {
    // Another costume's photos are in use now.
    const tryOns = [tryOn("new", { body: "y2" }), tryOn("old")]
    expect(currentTryOn(tryOns, { ...pearl, room: room("z", "z") })?.id).toBe(
      "new"
    )
    expect(currentTryOn(tryOns, { ...pearl, room: room(null, null) })?.id).toBe(
      "new"
    )
  })

  it("matches the face alone for a costume that is all makeup", () => {
    const tryOns = [
      tryOn("new", { face: "x2", body: null, made: null }),
      tryOn("old", { body: null, made: null }),
    ]
    expect(
      currentTryOn(tryOns, {
        ...pearl,
        allMakeup: true,
        room: room("x", "y"),
      })?.id
    ).toBe("old")
  })

  it("keeps to the costume and the renderer in use", () => {
    const tryOns = [
      tryOn("other costume", { slug: "ghostface" }),
      tryOn("fake", { renderer: "fake" }),
      tryOn("real", { face: "x2" }),
    ]
    expect(currentTryOn(tryOns, { ...pearl, room: room("x", "y") })?.id).toBe(
      "real"
    )
    expect(
      currentTryOn(tryOns, {
        ...pearl,
        renderer: undefined,
        room: room("x", "y"),
      })
    ).toBeNull()
  })

  it("is none for a costume never tried on", () => {
    expect(currentTryOn([], { ...pearl, room: room("x", "y") })).toBeNull()
  })

  it("leaves out try-ons of an outfit picture since replaced", () => {
    const withGarment = {
      ...pearl,
      costume: { ...pearl.costume, garment: photo(garment) },
      room: room("x", "y"),
    }
    // Made with the first photo, before the costume had its garment, by
    // the record or (made before garments were recorded) by default.
    expect(currentTryOn([tryOn("old")], withGarment)).toBeNull()
    expect(
      currentTryOn([tryOn("older", { legacy: true })], withGarment)
    ).toBeNull()
    expect(
      currentTryOn(
        [tryOn("new", { made: garment, body: "y2" }), tryOn("old")],
        withGarment
      )?.id
    ).toBe("new")
  })

  it("counts a try-on recorded before garments as made with the first photo", () => {
    const old = tryOn("old", { legacy: true })
    expect(currentTryOn([old], { ...pearl, room: room("x", "y") })?.id).toBe(
      "old"
    )
    // And one of a costume that was all makeup as made with none.
    const face = tryOn("face", { legacy: true, body: null })
    expect(
      currentTryOn([face], { ...pearl, allMakeup: true, room: room("x", null) })
        ?.id
    ).toBe("face")
    expect(currentTryOn([face], { ...pearl, room: room("x", "y") })).toBeNull()
  })
})
