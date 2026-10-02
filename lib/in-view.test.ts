import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/** A stand-in for the browser's IntersectionObserver, driven by the test. */
class FakeObserver {
  static instances: FakeObserver[] = []
  watched = new Set<Element>()
  constructor(
    readonly report: (entries: Partial<IntersectionObserverEntry>[]) => void,
    readonly options: IntersectionObserverInit
  ) {
    FakeObserver.instances.push(this)
  }
  observe(element: Element) {
    this.watched.add(element)
  }
  unobserve(element: Element) {
    this.watched.delete(element)
  }
  /** The element moves into (or out of) the watched part of the window. */
  move(target: Element, isIntersecting: boolean) {
    this.report([{ target, isIntersecting }])
  }
}

const load = async () => {
  vi.resetModules()
  return (await import("./in-view")).onceInView
}

beforeEach(() => {
  FakeObserver.instances = []
  vi.stubGlobal("IntersectionObserver", FakeObserver)
})
afterEach(() => vi.unstubAllGlobals())

describe("onceInView", () => {
  it("calls back the first time the element is in view, then stops watching", async () => {
    const onceInView = await load()
    const element = document.createElement("div")
    const seen = vi.fn()
    onceInView(element, seen)
    const [observer] = FakeObserver.instances

    observer.move(element, false)
    expect(seen).not.toHaveBeenCalled()
    observer.move(element, true)
    observer.move(element, true)
    expect(seen).toHaveBeenCalledTimes(1)
    expect(observer.watched.has(element)).toBe(false)
  })

  it("watches every element with one observer", async () => {
    const onceInView = await load()
    const elements = Array.from({ length: 82 }, () =>
      document.createElement("div")
    )
    for (const element of elements) onceInView(element, () => {})
    expect(FakeObserver.instances).toHaveLength(1)
    expect(FakeObserver.instances[0].watched.size).toBe(82)
  })

  it("waits until the element is above the bottom fifth of the window", async () => {
    const onceInView = await load()
    onceInView(document.createElement("div"), () => {})
    expect(FakeObserver.instances[0].options).toEqual({
      rootMargin: "0px 0px -20% 0px",
    })
  })

  it("stops watching when told to", async () => {
    const onceInView = await load()
    const element = document.createElement("div")
    const seen = vi.fn()
    const stop = onceInView(element, seen)
    const [observer] = FakeObserver.instances
    stop()
    expect(observer.watched.has(element)).toBe(false)
    observer.move(element, true)
    expect(seen).not.toHaveBeenCalled()
  })

  it("treats every element as in view where the browser cannot tell", async () => {
    vi.stubGlobal("IntersectionObserver", undefined)
    const onceInView = await load()
    const seen = vi.fn()
    const stop = onceInView(document.createElement("div"), seen)
    expect(seen).toHaveBeenCalledTimes(1)
    expect(() => stop()).not.toThrow()
  })
})
