import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { RemoteBasket } from "@/lib/basket/remote"
import { announced, renderWithBasket } from "@/test/basket"

import { BasketSummary } from "./basket-list"
import { useBasket } from "./basket-provider"
import { BasketToggle } from "./basket-toggle"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

// The account's basket, as a test wants it to answer.
const remote = vi.hoisted(() => ({
  open: vi.fn<(uid: string) => Promise<RemoteBasket>>(),
}))
vi.mock("@/lib/basket/firestore", () => ({
  openAccountBasket: (uid: string) => remote.open(uid),
}))

afterEach(() => {
  vi.restoreAllMocks()
  remote.open.mockReset()
})

describe("BasketProvider", () => {
  it("tells a signed-in visitor, in words, when a change was refused", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    remote.open.mockResolvedValue({
      watch: (next) => {
        queueMicrotask(() => next({ slugs: [], confirmed: true }))
        return () => {}
      },
      apply: () => Promise.reject(new Error("permission-denied")),
    })
    renderWithBasket(<BasketToggle slug="pearl" name="Pearl" />, {
      account: "alice",
    })
    await act(() => Promise.resolve())
    await userEvent.click(screen.getByRole("button"))
    await vi.waitFor(() =>
      expect(announced()).toBe(
        "Your account didn't take that change, so it was undone. Try again."
      )
    )
    expect(
      screen.getByRole("button", { name: "Add Pearl to My Pumpkin Basket" })
    ).toBeInTheDocument()
    // The details go to the console, for developers, never on screen.
    expect(console.error).toHaveBeenCalled()
    expect(document.body).not.toHaveTextContent("permission-denied")
  })

  it("says when the account can't be reached, never the error itself", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    remote.open.mockRejectedValue(
      new Error("Firebase is not configured: set NEXT_PUBLIC_apiKey")
    )
    renderWithBasket(<BasketSummary />, { account: "alice" })
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your account can't be reached right now, so changes here may not be saved. Reload the page to try again."
    )
    expect(document.body).not.toHaveTextContent("Firebase")
  })

  it("counts the account's basket once it answers", async () => {
    remote.open.mockResolvedValue({
      watch: (next) => {
        queueMicrotask(() => next({ slugs: ["pearl"], confirmed: true }))
        return () => {}
      },
      apply: () => Promise.resolve(),
    })
    renderWithBasket(<BasketSummary />, { account: "alice" })
    expect(await screen.findByText("1 costume")).toBeInTheDocument()
    expect(remote.open).toHaveBeenCalledWith("alice")
  })

  it("never loads the account's basket for a guest", () => {
    renderWithBasket(<BasketSummary />)
    expect(remote.open).not.toHaveBeenCalled()
  })

  it("outside its provider, is an empty basket that never breaks the page", () => {
    function Probe() {
      const { ready, slugs, add } = useBasket()
      return (
        <button onClick={() => add("pearl")}>
          {String(ready)} {slugs.length}
        </button>
      )
    }
    render(<Probe />)
    act(() => screen.getByRole("button").click())
    expect(screen.getByRole("button")).toHaveTextContent("false 0")
  })
})
