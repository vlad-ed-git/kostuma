import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { PhotoConsent } from "./photo-consent"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

describe("PhotoConsent", () => {
  it("asks, unticked, in the words the try-on keeps, with the Privacy policy a new tab away", async () => {
    const onChange = vi.fn()
    renderInEnglish(
      <PhotoConsent agreed={false} error={false} onChange={onChange} />
    )
    const box = screen.getByRole("checkbox", {
      name: "I agree that Kostuma sends my photos to its image service, YouCam (Perfect Corp.), which analyzes my face, skin tone and body only to make my pictures. Kostuma keeps them for up to 12 months, or until I delete them; YouCam deletes its copies within 30 days. More in the Privacy policy.",
    })
    expect(box).not.toBeChecked()
    const policy = screen.getByRole("link", { name: "Privacy policy" })
    expect(policy).toHaveAttribute("href", "/privacy")
    expect(policy).toHaveAttribute("target", "_blank")
    await userEvent.click(box)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("says what to do when the try-on was started without it", () => {
    renderInEnglish(<PhotoConsent agreed={false} error onChange={() => {}} />)
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription(
      "Tick the box to agree before the try-on starts."
    )
  })
})
