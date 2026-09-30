// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

import { beginNavigation, isNavigating, subscribe } from "./navigation-status"

const ends: Array<() => void> = []
const begin = () => {
  const end = beginNavigation()
  ends.push(end)
  return end
}

afterEach(() => {
  for (const end of ends.splice(0)) end()
})

describe("navigation status", () => {
  it("is idle until a navigation begins, and again once it ends", () => {
    expect(isNavigating()).toBe(false)
    const end = begin()
    expect(isNavigating()).toBe(true)
    end()
    expect(isNavigating()).toBe(false)
  })

  it("waits for every overlapping navigation", () => {
    const first = begin()
    const second = begin()
    first()
    expect(isNavigating()).toBe(true)
    second()
    expect(isNavigating()).toBe(false)
  })

  it("ignores ending the same navigation twice", () => {
    const first = begin()
    const second = begin()
    first()
    first()
    expect(isNavigating()).toBe(true)
    second()
    expect(isNavigating()).toBe(false)
  })

  it("tells subscribers about every change until they unsubscribe", () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)
    const end = begin()
    end()
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    begin()
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
