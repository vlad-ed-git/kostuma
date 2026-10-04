import { act, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { renderToString } from "react-dom/server"
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import messages from "@/messages/en.json"
import { renderInEnglish } from "@/test/intl"

import { Tagline } from "./tagline"

const originalTz = process.env.TZ
beforeAll(() => {
  process.env.TZ = "UTC"
})
afterAll(() => {
  process.env.TZ = originalTz
})
afterEach(() => {
  vi.useRealTimers()
})

/** The visitor's clock reads `iso` (UTC here). */
function clockAt(iso: string) {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] })
  vi.setSystemTime(new Date(iso))
}

const title = () => screen.getByRole("heading", { level: 1 })

describe("Tagline", () => {
  it("says what the server guessed until the browser runs", () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Tagline holiday="christmas" />
      </NextIntlClientProvider>
    )
    expect(html).toContain("The darkest night has passed.")
    expect(html).toContain(
      "But you shall stay a monster until Santa comes. Ho. Ho. Ho."
    )
  })

  it("comes for Halloween until its night", () => {
    clockAt("2026-10-31T23:59:58Z")
    renderInEnglish(<Tagline holiday="halloween" />)
    expect(title()).toHaveTextContent("The darkest night is coming.")
    expect(screen.getByText("Transform into a monster.")).toBeVisible()
  })

  it("keeps the visitor a monster once the night has passed, at midnight", () => {
    clockAt("2026-10-31T23:59:58Z")
    renderInEnglish(<Tagline holiday="halloween" />)
    act(() => vi.advanceTimersByTime(2_000))
    expect(title()).toHaveTextContent("The darkest night has passed.")
    expect(
      screen.getByText(
        "But you shall stay a monster until Santa comes. Ho. Ho. Ho."
      )
    ).toBeVisible()
  })

  it("corrects the server's guess by the visitor's own clock", () => {
    clockAt("2026-11-01T00:00:00Z")
    renderInEnglish(<Tagline holiday="halloween" />)
    expect(title()).toHaveTextContent("The darkest night has passed.")
  })

  it("comes for the next Halloween once Santa has come", () => {
    clockAt("2026-12-24T23:59:59Z")
    renderInEnglish(<Tagline holiday="christmas" />)
    expect(title()).toHaveTextContent("The darkest night has passed.")
    act(() => vi.advanceTimersByTime(1_000))
    expect(title()).toHaveTextContent("The darkest night is coming.")
  })

  it("stops its clock when it leaves the page", () => {
    clockAt("2026-11-10T12:00:00Z")
    const { unmount } = renderInEnglish(<Tagline holiday="christmas" />)
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
