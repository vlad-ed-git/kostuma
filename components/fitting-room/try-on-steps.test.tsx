import { waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { StepView, TryOnView } from "@/lib/fitting-room/try-on"
import { renderInEnglish } from "@/test/intl"

import { type GuideText, TryOnSteps } from "./try-on-steps"

const SAFETY =
  "Use cosmetic-grade products only, patch-test 24 hours before, and keep paint and fake blood out of your eyes."

const done = (n: number): StepView => ({
  status: "done",
  image: `/api/fitting-room/try-ons/t/${n}?v=1`,
})

const guide: GuideText = {
  steps: [
    {
      title: "Corpse base",
      howTo: "Pat gray cream paint over the whole face.",
      products: [
        { name: "gray cream face paint", search: "gray cream face paint" },
        { name: "setting powder", search: "setting powder" },
      ],
    },
    {
      title: "Sunken eyes",
      howTo: "Smudge black around each eye.",
      products: [{ name: "black eyeshadow", search: "black eyeshadow" }],
    },
  ],
  finish: "A striped suit.",
}

/** A finished try-on: the outfit and the dressed face, then the makeup. */
const dressed: TryOnView = {
  id: "t",
  slug: "beetlejuice",
  status: "done",
  failure: null,
  face: "face",
  body: "body",
  outfit: true,
  dressed: true,
  busy: false,
  steps: [done(0), done(1), done(2), done(3)],
}

/** A costume all makeup: no outfit, the guide starts on the face. */
const allMakeup: TryOnView = {
  ...dressed,
  body: null,
  outfit: false,
  dressed: false,
  steps: [done(0), done(1)],
}

/**
 * The try-on as the page shows it. Queries stay inside it: the guide on
 * paper hangs off <body>, where only print shows it (globals.css, which
 * jsdom doesn't load).
 */
let ui: ReturnType<typeof within>

const show = (tryOn: TryOnView) => {
  const view = renderInEnglish(
    <TryOnSteps
      tryOn={tryOn}
      name="Beetlejuice"
      guide={guide}
      title={<h2>Beetlejuice</h2>}
    />
  )
  ui = within(view.container)
  return view
}

/** Picks a frame on the film strip. */
const frame = (name: string) =>
  userEvent.click(
    within(ui.getByRole("list", { name: "Your pictures" })).getByRole(
      "button",
      { name }
    )
  )

beforeEach(() => {
  // jsdom lays nothing out: the strip's scrolling has nowhere to go.
  Element.prototype.scrollTo = vi.fn()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** A phone that can share files: a coarse pointer, the Web Share API. */
function phone(share: (data: ShareData) => Promise<void>) {
  const coarse = window.matchMedia
  vi.stubGlobal("matchMedia", (query: string) => ({
    ...coarse(query),
    matches: query === "(pointer: coarse)",
  }))
  Object.assign(navigator, {
    canShare: (data: ShareData) => (data.files?.length ?? 0) > 0,
    share: vi.fn(share),
  })
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(new Blob(["jpeg"], { type: "image/jpeg" })))
  )
  return navigator.share as ReturnType<typeof vi.fn>
}

describe("TryOnSteps", () => {
  it("says what the makeup asks before step 1, on the outfit's card", async () => {
    show(dressed)
    // Done: the mirror shows the whole transformation, the last step.
    expect(ui.getByText("Step 2 of 2")).toBeVisible()
    expect(ui.queryByText(SAFETY)).not.toBeInTheDocument()

    await frame("The outfit")
    expect(ui.getByText("Now let’s get started on the makeup.")).toBeVisible()
    // How long (two steps: 16 minutes, about 15), every product once.
    expect(ui.getByText("The makeup takes about 15 minutes.")).toBeVisible()
    const needs = ui.getByRole("list", { name: "What you need" })
    expect(
      within(needs)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["gray cream face paint", "setting powder", "black eyeshadow"])
    expect(
      within(needs).getByRole("link", {
        name: "Find black eyeshadow on Amazon (opens in a new tab)",
      })
    ).toHaveAttribute("href", "https://www.amazon.com/s?k=black%20eyeshadow")
    expect(ui.getByText(SAFETY)).toBeVisible()

    await userEvent.click(ui.getByRole("button", { name: "Apply makeup" }))
    expect(ui.getByText("Step 1 of 2")).toBeVisible()
    expect(ui.queryByText(SAFETY)).not.toBeInTheDocument()
    expect(
      ui.queryByRole("list", { name: "What you need" })
    ).not.toBeInTheDocument()
  })

  it("prints the whole guide, and only on paper", () => {
    const { container } = show(dressed)
    // Beside the page, where print shows it alone (globals.css).
    const paper = document.body.querySelector(":scope > .print-guide")
    expect(paper).not.toBeNull()
    expect(container.contains(paper)).toBe(false)
    expect(paper).toHaveTextContent("Beetlejuice")
    expect(paper).toHaveTextContent("The makeup takes about 15 minutes.")
    expect(paper).toHaveTextContent(SAFETY)
    for (const text of [
      "Step 1 of 2",
      "Corpse base",
      "Pat gray cream paint over the whole face.",
      "gray cream face paint · setting powder",
      "Step 2 of 2",
      "Sunken eyes",
      "To finish",
      "A striped suit.",
    ])
      expect(paper).toHaveTextContent(text)
  })

  it("says it on step 1 when there is no outfit, and only there", async () => {
    show(allMakeup)
    expect(ui.queryByText(SAFETY)).not.toBeInTheDocument()
    await frame("Step 1: Corpse base")
    expect(ui.getByText("Step 1 of 2")).toBeVisible()
    expect(ui.getByText(SAFETY)).toBeVisible()
    await userEvent.click(ui.getByRole("button", { name: "Next step" }))
    expect(ui.queryByText(SAFETY)).not.toBeInTheDocument()
  })

  it("saves the picture in the mirror, the same JPEG as a named file", async () => {
    show(dressed)
    const save = ui.getByRole("link", { name: "Save this picture" })
    expect(save).toHaveTextContent("Save")
    expect(save).toHaveAttribute(
      "href",
      "/api/fitting-room/try-ons/t/3?v=1&download=1"
    )
    expect(save).toHaveAttribute("download", "kostuma-beetlejuice-step-2.jpg")

    await frame("The outfit")
    expect(ui.getByRole("link", { name: "Save this picture" })).toHaveAttribute(
      "download",
      "kostuma-beetlejuice-outfit.jpg"
    )
  })

  it("offers to save only a picture that is out", () => {
    const { unmount } = show({
      ...dressed,
      status: "running",
      steps: [done(0), done(1), done(2)],
    })
    // The mirror follows the newest picture: step 1's.
    expect(ui.getByRole("link", { name: "Save this picture" })).toHaveAttribute(
      "download",
      "kostuma-beetlejuice-step-1.jpg"
    )
    unmount()

    show({
      ...dressed,
      status: "running",
      steps: [{ status: "working", image: null }],
    })
    expect(
      ui.queryByRole("link", { name: "Save this picture" })
    ).not.toBeInTheDocument()
  })

  it("hands the file to a phone's share sheet, from the tap itself", async () => {
    const share = phone(async () => {})
    show(dressed)
    // The file is fetched before the tap.
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/fitting-room/try-ons/t/3?v=1")
    )
    const save = ui.getByRole("link", { name: "Save this picture" })
    await waitFor(async () => {
      share.mockClear()
      await userEvent.click(save)
      expect(share).toHaveBeenCalledTimes(1)
    })
    const [{ files }] = share.mock.calls[0] as [ShareData]
    expect(files).toHaveLength(1)
    expect(files![0].name).toBe("kostuma-beetlejuice-step-2.jpg")
    expect(files![0].type).toBe("image/jpeg")
  })

  it("downloads instead when the share fails, but not when it is closed", async () => {
    let refusal = new DOMException("closed", "AbortError")
    const share = phone(async () => {
      throw refusal
    })
    const clicks = vi.spyOn(HTMLAnchorElement.prototype, "click")
    // jsdom can't download: the default is stopped once it would happen.
    const downloads: string[] = []
    const stop = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      downloads.push((event.target as HTMLAnchorElement).href)
      event.preventDefault()
    }
    window.addEventListener("click", stop)
    try {
      show(dressed)
      const save = ui.getByRole("link", { name: "Save this picture" })
      await waitFor(async () => {
        share.mockClear()
        await userEvent.click(save)
        expect(share).toHaveBeenCalledTimes(1)
      })
      expect(clicks).not.toHaveBeenCalled()
      expect(downloads).toEqual([])

      refusal = new DOMException("not now", "NotAllowedError")
      await userEvent.click(save)
      await waitFor(() => expect(clicks).toHaveBeenCalledTimes(1))
      expect(downloads).toEqual([
        "http://localhost:3000/api/fitting-room/try-ons/t/3?v=1&download=1",
      ])
    } finally {
      window.removeEventListener("click", stop)
    }
  })
})
