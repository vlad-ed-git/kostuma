import { describe, expect, it } from "vitest"

import {
  allowanceFrom,
  allowanceOf,
  ended,
  erased,
  FAILED_TRIES,
  holding,
  madePictures,
  NO_RECORD,
  readRecord,
  recordOf,
} from "./free-costume"
import type { StoredStep, TryOn } from "./try-on"

type Seen = Pick<TryOn, "id" | "slug" | "renderer" | "status">

const tryOn = (
  slug: string,
  status: TryOn["status"],
  renderer: TryOn["renderer"] = "youcam"
): Seen => ({ id: `${slug}-${status}`, slug, status, renderer })

const step = (status: StoredStep["status"]) => ({ status }) as StoredStep

describe("allowanceOf (accounts from before records)", () => {
  it("is free for an account with no try-on", () => {
    expect(allowanceOf([], 0, "youcam")).toEqual({
      free: true,
      triesLeft: FAILED_TRIES,
    })
  })

  it("is held by a running try-on, and used by a done one", () => {
    for (const status of ["running", "done"] as const)
      expect(allowanceOf([tryOn("pennywise", status)], 0, "youcam")).toEqual({
        free: false,
        costume: "pennywise",
        tryOn: `pennywise-${status}`,
      })
  })

  it("names the newest costume that has it", () => {
    const tryOns = [
      tryOn("chucky", "failed"),
      tryOn("pennywise", "done"),
      tryOn("ghostface", "done"),
    ]
    expect(allowanceOf(tryOns, 0, "youcam")).toMatchObject({
      free: false,
      costume: "pennywise",
    })
  })

  it("comes back from failed try-ons", () => {
    const tryOns = [tryOn("chucky", "failed"), tryOn("pennywise", "failed")]
    expect(allowanceOf(tryOns, 0, "youcam")).toEqual({
      free: true,
      triesLeft: FAILED_TRIES,
    })
  })

  it(`is gone after ${FAILED_TRIES} failures once pictures were made`, () => {
    expect(allowanceOf([], FAILED_TRIES - 1, "youcam")).toEqual({
      free: true,
      triesLeft: 1,
    })
    expect(allowanceOf([], FAILED_TRIES, "youcam")).toEqual({
      free: false,
      costume: null,
      tryOn: null,
    })
  })

  it("counts only the renderer in use: a test build's fake never uses up a real one", () => {
    expect(
      allowanceOf([tryOn("chucky", "done", "fake")], 0, "youcam").free
    ).toBe(true)
    expect(allowanceOf([tryOn("chucky", "done")], 0, "fake").free).toBe(true)
  })
})

describe("the free costume's record", () => {
  const started = { id: "t1", slug: "pennywise", renderer: "youcam" } as const

  it("is held from the start, and used once done", () => {
    const held = holding(NO_RECORD, started)
    expect(allowanceFrom(held, "youcam")).toEqual({
      free: false,
      costume: "pennywise",
      tryOn: "t1",
    })
    const done = ended(
      held,
      { ...started, steps: [step("done")] },
      "done",
      null
    )
    expect(done.held.youcam).toEqual({
      tryOn: "t1",
      costume: "pennywise",
      done: true,
    })
  })

  it("comes back when its try-on fails, counting only the visitor's photos after pictures", () => {
    const held = holding(NO_RECORD, started)
    const pictures = { ...started, steps: [step("done"), step("failed")] }
    expect(ended(held, pictures, "failed", "face_photo")).toEqual({
      held: {},
      failedTries: 1,
    })
    expect(ended(held, pictures, "failed", "failed")).toEqual({
      held: {},
      failedTries: 0,
    })
    const none = { ...started, steps: [step("failed")] }
    expect(ended(held, none, "failed", "body_photo").failedTries).toBe(0)
  })

  it("leaves another try-on's hold alone", () => {
    const held = holding(NO_RECORD, started)
    const other = { id: "t2", renderer: "youcam" as const, steps: [] }
    expect(ended(held, other, "failed", "failed").held).toEqual(held.held)
  })

  it("stays used when the try-ons are deleted: one still running keeps it if pictures were made", () => {
    const record = holding(NO_RECORD, started)
    const running = {
      ...started,
      status: "running" as const,
      steps: [step("done")],
    }
    expect(erased(record, [running]).held.youcam?.done).toBe(true)
    expect(
      erased(record, [{ ...running, steps: [step("running")] }]).held
    ).toEqual({})
    const done = ended(record, running, "done", null)
    expect(erased(done, [{ ...running, status: "done" }])).toEqual(done)
  })

  it("is worked out for an account from before records", () => {
    expect(
      recordOf([tryOn("chucky", "done"), tryOn("ghostface", "done")], 1)
    ).toEqual({
      held: {
        youcam: { tryOn: "chucky-done", costume: "chucky", done: true },
      },
      failedTries: 1,
    })
  })

  it("reads what was stored, and nothing malformed", () => {
    expect(readRecord(undefined)).toBeNull()
    expect(
      readRecord({
        held: {
          youcam: { tryOn: "t1", costume: "pennywise", done: true },
          fake: { tryOn: 3 },
          other: { tryOn: "t9", costume: "x" },
        },
        failedTries: "2",
      })
    ).toEqual({
      held: { youcam: { tryOn: "t1", costume: "pennywise", done: true } },
      failedTries: 0,
    })
  })
})

describe("madePictures", () => {
  it("is true once any picture came back", () => {
    expect(madePictures({ steps: [step("done"), step("failed")] })).toBe(true)
  })

  it("is false when nothing came back: no units were spent", () => {
    expect(madePictures({ steps: [step("failed"), step("waiting")] })).toBe(
      false
    )
    expect(madePictures({ steps: [] })).toBe(false)
  })
})
