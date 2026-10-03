import { describe, expect, it } from "vitest"

import { allowanceOf, FAILED_TRIES, madePictures } from "./free-costume"
import type { StoredStep, TryOn } from "./try-on"

type Seen = Pick<TryOn, "slug" | "renderer" | "status">

const tryOn = (
  slug: string,
  status: TryOn["status"],
  renderer: TryOn["renderer"] = "youcam"
): Seen => ({ slug, status, renderer })

describe("allowanceOf", () => {
  it("is free for an account with no try-on", () => {
    expect(allowanceOf([], 0, "youcam")).toEqual({ free: true })
  })

  it("is held by a running try-on, and used by a done one", () => {
    for (const status of ["running", "done"] as const)
      expect(allowanceOf([tryOn("pennywise", status)], 0, "youcam")).toEqual({
        free: false,
        costume: "pennywise",
      })
  })

  it("names the newest costume that has it", () => {
    const tryOns = [
      tryOn("chucky", "failed"),
      tryOn("pennywise", "done"),
      tryOn("ghostface", "done"),
    ]
    expect(allowanceOf(tryOns, 0, "youcam")).toEqual({
      free: false,
      costume: "pennywise",
    })
  })

  it("comes back from failed try-ons", () => {
    const tryOns = [tryOn("chucky", "failed"), tryOn("pennywise", "failed")]
    expect(allowanceOf(tryOns, 0, "youcam")).toEqual({ free: true })
  })

  it(`is gone after ${FAILED_TRIES} failures once pictures were made`, () => {
    expect(allowanceOf([], FAILED_TRIES - 1, "youcam")).toEqual({ free: true })
    expect(allowanceOf([], FAILED_TRIES, "youcam")).toEqual({
      free: false,
      costume: null,
    })
  })

  it("counts only the renderer in use: a test build's fake never uses up a real one", () => {
    expect(allowanceOf([tryOn("chucky", "done", "fake")], 0, "youcam")).toEqual(
      { free: true }
    )
    expect(allowanceOf([tryOn("chucky", "done")], 0, "fake")).toEqual({
      free: true,
    })
  })
})

describe("madePictures", () => {
  const step = (status: StoredStep["status"]) => ({ status }) as StoredStep

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
