import { act, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { beginNavigation } from "@/lib/navigation-status"
import { renderInEnglish } from "@/test/intl"

import { CueMark } from "./cue-mark"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("CueMark", () => {
  it("rests hidden, with an empty status message", () => {
    const { container } = renderInEnglish(<CueMark />)
    expect(container.querySelector(".cue-mark")).not.toHaveAttribute(
      "data-active"
    )
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })

  it("burns while a page loads, and goes out when it arrives", () => {
    const { container } = renderInEnglish(<CueMark />)
    const mark = container.querySelector(".cue-mark")
    let end = () => {}
    act(() => {
      end = beginNavigation()
    })
    expect(mark).toHaveAttribute("data-active")
    expect(mark).toHaveAttribute("aria-hidden", "true")
    act(() => end())
    expect(mark).not.toHaveAttribute("data-active")
  })

  it("tells screen readers only when the page is slow", () => {
    renderInEnglish(<CueMark />)
    let end = () => {}
    act(() => {
      end = beginNavigation()
    })
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole("status")).toHaveTextContent("Loading…")
    act(() => end())
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })

  it("stays quiet for a quick page", () => {
    renderInEnglish(<CueMark />)
    let end = () => {}
    act(() => {
      end = beginNavigation()
    })
    act(() => vi.advanceTimersByTime(400))
    act(() => end())
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })
})
