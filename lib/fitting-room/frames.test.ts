// @vitest-environment node
import { describe, expect, it } from "vitest"

import { framesOf, renderingFrame, shownFrame } from "./frames"
import type { StepView, TryOnView } from "./try-on"

const done = (index: number): StepView => ({
  status: "done",
  image: `/api/fitting-room/try-ons/t/${index}?v=1`,
})
const working: StepView = { status: "working", image: null }
const failed: StepView = { status: "failed", image: null }

function tryOn(
  status: TryOnView["status"],
  steps: StepView[],
  outfit = true
): TryOnView {
  return {
    id: "t",
    slug: "beetlejuice",
    status,
    failure: status === "failed" ? "face_photo" : null,
    face: "f",
    body: outfit ? "b" : null,
    outfit,
    steps,
  }
}

describe("framesOf", () => {
  it("lists the outfit, the face before, then every makeup step", () => {
    const view = tryOn("running", [done(0), done(1), working])
    expect(framesOf(view, 2)).toEqual([
      { kind: "outfit", step: done(0) },
      { kind: "before" },
      { kind: "step", number: 1, step: done(1) },
      { kind: "step", number: 2, step: working },
    ])
  })

  it("has no outfit for a costume that is all makeup", () => {
    const view = tryOn("running", [done(0), working], false)
    expect(framesOf(view, 2).map((frame) => frame.kind)).toEqual([
      "before",
      "step",
      "step",
    ])
    expect(framesOf(view, 2)[1]).toEqual({
      kind: "step",
      number: 1,
      step: done(0),
    })
  })

  it("keeps every step of the guide, even one the try-on lacks", () => {
    const frames = framesOf(tryOn("running", [working]), 2)
    expect(frames).toHaveLength(4)
    expect(frames[3]).toEqual({ kind: "step", number: 2, step: undefined })
  })
})

describe("renderingFrame", () => {
  it("is the outfit first", () => {
    const view = tryOn("running", [working, working, working])
    expect(renderingFrame(framesOf(view, 2), view)).toBe(0)
  })

  it("is the first step not done after it, skipping the face before", () => {
    const view = tryOn("running", [done(0), done(1), working])
    expect(renderingFrame(framesOf(view, 2), view)).toBe(3)
  })

  it("is none once the try-on has ended", () => {
    for (const view of [
      tryOn("done", [done(0), done(1)]),
      tryOn("failed", [done(0), failed]),
    ])
      expect(renderingFrame(framesOf(view, 1), view)).toBe(-1)
  })
})

describe("shownFrame", () => {
  it("shows the frame rendering now while nothing is out yet", () => {
    const view = tryOn("running", [working, working])
    expect(shownFrame(framesOf(view, 1), view)).toBe(0)
    const face = tryOn("running", [working, working], false)
    expect(shownFrame(framesOf(face, 2), face)).toBe(1)
  })

  it("follows the newest picture while the try-on runs", () => {
    const outfit = tryOn("running", [done(0), working, working])
    expect(shownFrame(framesOf(outfit, 2), outfit)).toBe(0)
    const step = tryOn("running", [done(0), done(1), working])
    expect(shownFrame(framesOf(step, 2), step)).toBe(2)
  })

  it("shows the whole transformation, the last step, once done", () => {
    const view = tryOn("done", [done(0), done(1), done(2)])
    expect(shownFrame(framesOf(view, 2), view)).toBe(3)
  })

  it("shows the newest picture of a failed try-on", () => {
    const view = tryOn("failed", [done(0), failed, failed])
    expect(shownFrame(framesOf(view, 2), view)).toBe(0)
  })

  it("shows the first frame not rendered when a try-on failed at once", () => {
    const view = tryOn("failed", [failed, failed])
    expect(shownFrame(framesOf(view, 1), view)).toBe(0)
    const face = tryOn("failed", [failed], false)
    expect(shownFrame(framesOf(face, 1), face)).toBe(1)
  })

  it("falls back on the face before when no step can be shown", () => {
    const view = tryOn("failed", [], false)
    expect(shownFrame(framesOf(view, 0), view)).toBe(0)
  })
})
