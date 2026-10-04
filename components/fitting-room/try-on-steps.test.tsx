import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

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

const show = (tryOn: TryOnView) =>
  renderInEnglish(
    <TryOnSteps
      tryOn={tryOn}
      name="Beetlejuice"
      guide={guide}
      title={<h2>Beetlejuice</h2>}
    />
  )

/** Picks a frame on the film strip. */
const frame = (name: string) =>
  userEvent.click(
    within(screen.getByRole("list", { name: "Your pictures" })).getByRole(
      "button",
      { name }
    )
  )

beforeEach(() => {
  // jsdom lays nothing out: the strip's scrolling has nowhere to go.
  Element.prototype.scrollTo = vi.fn()
})

describe("TryOnSteps", () => {
  it("says what the makeup asks before step 1, on the outfit's card", async () => {
    show(dressed)
    // Done: the mirror shows the whole transformation, the last step.
    expect(screen.getByText("Step 2 of 2")).toBeVisible()
    expect(screen.queryByText(SAFETY)).not.toBeInTheDocument()

    await frame("The outfit")
    expect(
      screen.getByText("Now let’s get started on the makeup.")
    ).toBeVisible()
    expect(screen.getByText(SAFETY)).toBeVisible()

    await userEvent.click(screen.getByRole("button", { name: "Apply makeup" }))
    expect(screen.getByText("Step 1 of 2")).toBeVisible()
    expect(screen.queryByText(SAFETY)).not.toBeInTheDocument()
  })

  it("says it on step 1 when there is no outfit, and only there", async () => {
    show(allMakeup)
    expect(screen.queryByText(SAFETY)).not.toBeInTheDocument()
    await frame("Step 1: Corpse base")
    expect(screen.getByText("Step 1 of 2")).toBeVisible()
    expect(screen.getByText(SAFETY)).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: "Next step" }))
    expect(screen.queryByText(SAFETY)).not.toBeInTheDocument()
  })
})
