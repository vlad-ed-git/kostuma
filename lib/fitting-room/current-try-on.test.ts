// @vitest-environment node
import { describe, expect, it } from "vitest"

import { currentTryOn } from "./current-try-on"
import type { Room, TryOn } from "./try-on"

function tryOn(
  id: string,
  {
    slug = "pearl",
    face = "x",
    body = "y" as string | null,
    renderer = "youcam" as TryOn["renderer"],
  } = {}
): TryOn {
  return {
    id,
    slug,
    renderer,
    face,
    body,
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
})

const pearl = {
  slug: "pearl",
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
      tryOn("new", { face: "x2", body: null }),
      tryOn("old", { body: null }),
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
})
