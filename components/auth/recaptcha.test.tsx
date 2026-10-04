import { act, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

const script = () =>
  document.head.querySelector<HTMLScriptElement>(
    'script[src^="https://www.google.com/recaptcha/api.js"]'
  )

// The module keeps one script per page: a fresh module for each test.
async function load() {
  vi.resetModules()
  return import("./recaptcha")
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})
afterEach(() => {
  script()?.remove()
  delete window.grecaptcha
  vi.useRealTimers()
})

describe("Recaptcha", () => {
  it("loads Google's script once and shows the dark box in the language", async () => {
    const { Recaptcha } = await load()
    renderInEnglish(<Recaptcha siteKey="key" locale="zh" />)
    expect(script()).not.toBeNull()
    const render = vi.fn(() => 7)
    window.grecaptcha = { render, reset: vi.fn() }
    await act(async () => window.onRecaptchaLoad?.())
    expect(render).toHaveBeenCalledWith(expect.any(HTMLElement), {
      sitekey: "key",
      theme: "dark",
      hl: "zh-CN",
      // jsdom lays nothing out: no room counts as a narrow screen.
      size: "compact",
    })
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("says so, in words, when Google's script fails", async () => {
    const { Recaptcha } = await load()
    renderInEnglish(<Recaptcha siteKey="key" locale="en" />)
    await act(async () => script()?.onerror?.(new Event("error")))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The robot check couldn’t load. Check your connection, then reload the page."
    )
  })

  it("says so when Google stays silent, and shows a late box after all", async () => {
    const { Recaptcha, RECAPTCHA_PATIENCE_MS } = await load()
    renderInEnglish(<Recaptcha siteKey="key" locale="en" />)
    await act(async () => vi.advanceTimersByTime(RECAPTCHA_PATIENCE_MS))
    expect(screen.getByRole("alert")).toBeInTheDocument()

    window.grecaptcha = { render: vi.fn(() => 1), reset: vi.fn() }
    await act(async () => window.onRecaptchaLoad?.())
    expect(screen.queryByRole("alert")).toBeNull()
  })
})
