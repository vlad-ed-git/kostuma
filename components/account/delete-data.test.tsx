import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { DeleteData } from "./delete-data"

const mocks = vi.hoisted(() => ({
  deletePhotos: vi.fn(),
  deleteAccount: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock("@/lib/account/actions", () => ({
  deletePhotos: mocks.deletePhotos,
  deleteAccount: mocks.deleteAccount,
}))

afterEach(() => vi.clearAllMocks())

async function ask(button: string, title: string) {
  renderInEnglish(<DeleteData />)
  await userEvent.click(screen.getByRole("button", { name: button }))
  return screen.findByRole("alertdialog", { name: title })
}

describe("DeleteData", () => {
  it("asks before deleting the photos, keeping them by default", async () => {
    const popup = await ask(
      "Delete my photos and pictures",
      "Delete your photos and pictures?"
    )
    expect(popup).toHaveAccessibleDescription(
      "Your photos, every picture made from them and your try-ons will be deleted for good. Your free costume stays as it is."
    )
    // Focus moves in once the pop-up is in place.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Keep them" })).toHaveFocus()
    )
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(popup).not.toBeInTheDocument())
    expect(mocks.deletePhotos).not.toHaveBeenCalled()
  })

  it("deletes the photos once confirmed, and says so", async () => {
    mocks.deletePhotos.mockResolvedValue({ ok: true })
    await ask(
      "Delete my photos and pictures",
      "Delete your photos and pictures?"
    )
    await userEvent.click(screen.getByRole("button", { name: "Delete them" }))
    expect(mocks.deletePhotos).toHaveBeenCalledOnce()
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your photos and pictures are deleted."
    )
  })

  it("says what went wrong, and keeps the pop-up open to try again", async () => {
    mocks.deletePhotos.mockResolvedValue({ ok: false, error: "failed" })
    const popup = await ask(
      "Delete my photos and pictures",
      "Delete your photos and pictures?"
    )
    await userEvent.click(screen.getByRole("button", { name: "Delete them" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Try again."
    )
    expect(popup).toBeInTheDocument()
  })

  it("deletes the account once confirmed, in the page's language", async () => {
    mocks.deleteAccount.mockResolvedValue({ ok: true })
    const popup = await ask("Delete my account", "Delete your account?")
    expect(popup).toHaveAccessibleDescription(
      "Your account, photos, pictures, My Pumpkin Basket and place on Kostuma Pro's waitlist will be deleted for good. This can't be undone."
    )
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Keep my account" })
      ).toHaveFocus()
    )
    // The pop-up's own button (the page's one sits behind it).
    const buttons = screen.getAllByRole("button", { name: "Delete my account" })
    await userEvent.click(buttons.at(-1)!)
    expect(mocks.deleteAccount).toHaveBeenCalledWith("en")
  })
})
