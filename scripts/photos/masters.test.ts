// @vitest-environment node
import { describe, expect, it } from "vitest"

import { MASTER_SIDE, masterSize, subjectBox, withMargin } from "./masters.mjs"

/** An alpha plane with a solid rectangle in it. */
function plane(
  width: number,
  height: number,
  rect?: { left: number; top: number; width: number; height: number },
  value = 255
) {
  const alpha = new Uint8Array(width * height)
  if (rect)
    for (let y = rect.top; y < rect.top + rect.height; y++)
      for (let x = rect.left; x < rect.left + rect.width; x++)
        alpha[y * width + x] = value
  return alpha
}

describe("masterSize", () => {
  it("fits the long side to the master side", () => {
    expect(masterSize(4000, 6000)).toEqual({ width: 1365, height: MASTER_SIDE })
    expect(masterSize(3840, 2160)).toEqual({ width: MASTER_SIDE, height: 1152 })
  })

  it("never enlarges a smaller photo", () => {
    expect(masterSize(640, 853)).toEqual({ width: 640, height: 853 })
    expect(masterSize(MASTER_SIDE, MASTER_SIDE)).toEqual({
      width: MASTER_SIDE,
      height: MASTER_SIDE,
    })
  })
})

describe("subjectBox", () => {
  it("finds the box around the opaque pixels", () => {
    const rect = { left: 3, top: 2, width: 4, height: 5 }
    expect(subjectBox(plane(10, 10, rect), 10, 10)).toEqual(rect)
  })

  it("ignores faint specks below the threshold", () => {
    const alpha = plane(10, 10, { left: 4, top: 4, width: 2, height: 2 })
    alpha[0] = 15
    expect(subjectBox(alpha, 10, 10)).toEqual({
      left: 4,
      top: 4,
      width: 2,
      height: 2,
    })
  })

  it("returns null when nothing is opaque", () => {
    expect(subjectBox(plane(5, 5), 5, 5)).toBeNull()
  })

  it("refuses a plane of the wrong size", () => {
    expect(() => subjectBox(new Uint8Array(3), 2, 2)).toThrow()
  })
})

describe("withMargin", () => {
  it("adds the share of the longer side on every side", () => {
    // longer side 100 → 4 px each side
    expect(
      withMargin({ left: 50, top: 20, width: 100, height: 60 }, 300, 300)
    ).toEqual({
      left: 46,
      top: 16,
      width: 108,
      height: 68,
    })
  })

  it("stays inside the image where the frame cuts the subject", () => {
    expect(
      withMargin({ left: 0, top: 10, width: 100, height: 90 }, 100, 100)
    ).toEqual({
      left: 0,
      top: 6,
      width: 100,
      height: 94,
    })
  })
})
