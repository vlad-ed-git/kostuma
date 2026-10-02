import { act, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import messages from "@/messages/en.json"
import {
  announced,
  knownCostumes,
  renderWithBasket,
  storedSlugs,
} from "@/test/basket"

import { BasketProvider } from "./basket-provider"
import {
  BasketList,
  BasketSummary,
  CLEAR_WINDOW_MS,
  type BasketCostume,
} from "./basket-list"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock(
  "@/public/images/costume-placeholder.webp",
  () => import("@/test/placeholder")
)

const costume = (slug: string, name: string, year: number): BasketCostume => ({
  slug,
  name,
  films: [{ title: `${name}: the film`, year }],
  stores: [],
})

const costumes = [
  costume("ghostface", "Ghostface", 1996),
  costume("michael-myers", "Michael Myers", 1978),
  costume("pearl", "Pearl", 2022),
  costume("carrie-white", "Carrie White", 1976),
]

function renderBasket(stored: string[]) {
  return renderWithBasket(
    <>
      <BasketSummary />
      <BasketList costumes={costumes} />
    </>,
    { stored }
  )
}

const rows = () =>
  within(
    screen.getByRole("list", { name: "Costumes in My Pumpkin Basket" })
  ).getAllByRole("listitem")

afterEach(() => {
  vi.useRealTimers()
})

describe("BasketList", () => {
  it("lists the basket, the last added first, and counts it", () => {
    renderBasket(["pearl", "ghostface", "the-wolf-man"])
    expect(rows().map((row) => row.querySelector("a")?.textContent)).toEqual([
      "GhostfaceGhostface: the film (1996)",
      "PearlPearl: the film (2022)",
    ])
    expect(screen.getByText("2 costumes")).toBeInTheDocument()
  })

  it("gives each costume its page, Buy, Try on (soon) and Remove", () => {
    renderBasket(["ghostface"])
    const [row] = rows()
    const scope = within(row)
    expect(scope.getByRole("link", { name: /^Ghostface/ })).toHaveAttribute(
      "href",
      "/costumes/ghostface"
    )
    // No shop yet: it says so, rather than a button that goes nowhere.
    expect(scope.getByText("Buy")).toHaveTextContent("BuySoon")
    expect(
      scope.getByRole("link", { name: "Try on Ghostface (soon)" })
    ).toHaveAttribute("href", "/basket/fitting-room?costume=ghostface")
    expect(
      scope.getByRole("button", {
        name: "Remove Ghostface from My Pumpkin Basket",
      })
    ).toBeInTheDocument()
  })

  it("removes a costume and keeps the visitor's place on the next one", async () => {
    renderBasket(["pearl", "ghostface", "carrie-white"])
    // Newest first: Carrie White, Ghostface, Pearl.
    await userEvent.click(
      screen.getByRole("button", {
        name: "Remove Ghostface from My Pumpkin Basket",
      })
    )
    expect(storedSlugs()).toEqual(["pearl", "carrie-white"])
    expect(
      screen.getByRole("button", {
        name: "Remove Pearl from My Pumpkin Basket",
      })
    ).toHaveFocus()
    expect(announced()).toBe("Ghostface removed from My Pumpkin Basket.")

    // The last one: the one before it.
    await userEvent.click(
      screen.getByRole("button", {
        name: "Remove Pearl from My Pumpkin Basket",
      })
    )
    expect(
      screen.getByRole("button", {
        name: "Remove Carrie White from My Pumpkin Basket",
      })
    ).toHaveFocus()
  })

  it("shows the empty basket once the last costume is gone, focused", async () => {
    renderBasket(["pearl"])
    await userEvent.click(
      screen.getByRole("button", {
        name: "Remove Pearl from My Pumpkin Basket",
      })
    )
    const title = screen.getByRole("heading", { name: "Your basket is empty." })
    expect(title).toHaveFocus()
    expect(screen.getByText("The night is young.")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Browse costumes" })
    ).toHaveAttribute("href", "/#costumes")
    // No count over an empty basket: it says so itself.
    expect(screen.queryByText(/\d costumes?/)).toBeNull()
  })

  it("clears the basket only on a second click", async () => {
    renderBasket(["pearl", "ghostface"])
    await userEvent.click(screen.getByRole("button", { name: "Clear basket" }))
    expect(storedSlugs()).toEqual(["pearl", "ghostface"])
    expect(announced()).toBe("Click again to clear")

    await userEvent.click(
      screen.getByRole("button", { name: "Click again to clear" })
    )
    expect(storedSlugs()).toEqual([])
    expect(announced()).toBe("My Pumpkin Basket is empty.")
    expect(
      screen.getByRole("heading", { name: "Your basket is empty." })
    ).toHaveFocus()
  })

  it("forgets the first click after a few seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderBasket(["pearl"])
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await user.click(screen.getByRole("button", { name: "Clear basket" }))
    act(() => {
      vi.advanceTimersByTime(CLEAR_WINDOW_MS)
    })
    await user.click(screen.getByRole("button", { name: "Clear basket" }))
    expect(storedSlugs()).toEqual(["pearl"])
  })

  it("never tells the visitor where or how the basket is kept", () => {
    renderBasket(["pearl"])
    expect(document.body).not.toHaveTextContent(
      /device|account|stor(ed|age)|kept|saved|browser/i
    )
  })

  it("shows the empty basket when nothing was ever added", () => {
    renderBasket([])
    expect(
      screen.getByRole("heading", { name: "Your basket is empty." })
    ).not.toHaveFocus()
    expect(screen.queryByRole("button", { name: "Clear basket" })).toBeNull()
  })

  it("follows another tab", () => {
    renderBasket(["pearl"])
    act(() => {
      localStorage.setItem(
        "kostuma.basket",
        JSON.stringify({ v: 1, slugs: ["pearl", "ghostface"] })
      )
      window.dispatchEvent(
        new StorageEvent("storage", { key: "kostuma.basket" })
      )
    })
    expect(rows()).toHaveLength(2)
  })

  it("on the server: a placeholder, and the empty basket for no JavaScript", () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={messages}>
        <BasketProvider costumes={knownCostumes} account={null}>
          <BasketSummary />
          <BasketList costumes={costumes} />
        </BasketProvider>
      </NextIntlClientProvider>
    )
    expect(html).toContain("skeleton")
    // Shown only where scripts can't run.
    expect(html).toMatch(
      /hidden \[@media\(scripting:none\)\]:block.*Your basket is empty\./
    )
  })
})
