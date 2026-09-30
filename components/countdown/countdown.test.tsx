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

import { Countdown } from "./countdown"

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

const digits = () =>
  screen
    .getByRole("timer")
    .querySelectorAll("li > span:first-child")
    .values()
    .map((cell) => cell.textContent)
    .toArray()

describe("Countdown", () => {
  it("renders dashes on the server, which can't know the visitor's time", () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Countdown year={2026} />
      </NextIntlClientProvider>
    )
    expect(html.match(/>--</g)).toHaveLength(4)
    expect(html.replace(/<[^>]+>/g, "")).toContain(
      "Until Halloween · Saturday, October 31"
    )
    expect(html).not.toMatch(/\d+ days/)
  })

  it("counts down in the visitor's time, second by second", () => {
    clockAt("2026-10-01T13:45:30.250Z")
    renderInEnglish(<Countdown year={2026} />)
    expect(digits()).toEqual(["29", "10", "14", "30"])
    act(() => vi.advanceTimersByTime(750))
    expect(digits()).toEqual(["29", "10", "14", "29"])
    act(() => vi.advanceTimersByTime(1000))
    expect(digits()).toEqual(["29", "10", "14", "28"])
  })

  it("tells screen readers the time left in words, without the seconds", () => {
    clockAt("2026-10-01T13:45:30Z")
    renderInEnglish(<Countdown year={2026} />)
    expect(
      screen.getByText("29 days, 10 hours and 14 minutes until Halloween.")
    ).toBeInTheDocument()
    expect(screen.getByRole("timer")).toHaveAccessibleName(
      "Time until Halloween"
    )
  })

  it("speaks in the singular when one is left", () => {
    clockAt("2026-10-29T22:58:30Z")
    renderInEnglish(<Countdown year={2026} />)
    expect(
      screen.getByText("1 day, 1 hour and 1 minute until Halloween.")
    ).toBeInTheDocument()
  })

  it("turns to tonight at midnight, and stays for the whole day", () => {
    clockAt("2026-10-30T23:59:59Z")
    renderInEnglish(<Countdown year={2026} />)
    expect(digits()).toEqual(["00", "00", "00", "01"])
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText("Tonight.")).toBeInTheDocument()
    expect(screen.getByText("The darkest day is here.")).toBeInTheDocument()
    expect(screen.getByText("Saturday, October 31")).toBeInTheDocument()
    expect(screen.queryByRole("timer")).not.toBeInTheDocument()
  })

  it("counts to next year's Halloween from November 1", () => {
    clockAt("2026-11-01T00:00:00Z")
    // The server guessed this year's; the browser knows better.
    renderInEnglish(<Countdown year={2026} />)
    expect(screen.getByText(/^Until Halloween/)).toHaveTextContent(
      "Until Halloween · Sunday, October 31"
    )
    expect(digits()[0]).toBe("364")
  })

  it("stops its clock when it leaves the page", () => {
    clockAt("2026-10-01T13:45:30Z")
    const { unmount } = renderInEnglish(<Countdown year={2026} />)
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
