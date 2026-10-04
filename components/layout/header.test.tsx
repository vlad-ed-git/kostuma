import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { User } from "@/lib/auth/session"
import { renderInEnglish } from "@/test/intl"

import { Header as AsyncHeader } from "./header"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock("@/lib/auth/actions", () => ({ endSession: vi.fn() }))
const session = vi.hoisted(() => ({ user: null as User | null }))
vi.mock("@/lib/auth/session", () => ({ getUser: async () => session.user }))
vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl")
  const messages = (await import("@/messages/en.json")).default
  return {
    getTranslations: async (namespace: string) =>
      createTranslator({
        locale: "en",
        messages,
        namespace: namespace as never,
      }),
  }
})

afterEach(() => {
  session.user = null
})

/** The header, as the server renders it for this request. */
async function Header() {
  return AsyncHeader()
}

describe("Header", () => {
  it("leads home from the wordmark", async () => {
    renderInEnglish(await Header())
    expect(screen.getByRole("link", { name: "Kostuma" })).toHaveAttribute(
      "href",
      "/"
    )
  })

  it("leads to the two places of the flow: costumes, then the basket", async () => {
    renderInEnglish(await Header())
    const nav = screen.getByRole("navigation", { name: "Main" })
    const links = within(nav).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/#costumes",
      "/basket",
    ])
    expect(links.map((link) => link.textContent)).toEqual([
      "Costumes",
      "My Pumpkin Basket",
    ])
  })

  it("names My Pumpkin Basket, whose icon alone says nothing", async () => {
    renderInEnglish(await Header())
    expect(
      screen.getByRole("link", { name: "My Pumpkin Basket" })
    ).toHaveAttribute("href", "/basket")
  })

  it("offers sign-in, the language and the menu", async () => {
    renderInEnglish(await Header())
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in"
    )
    expect(
      screen.getByRole("button", { name: "Language: English" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Open the menu" })
    ).toBeInTheDocument()
  })

  it("shows a signed-in visitor's initials, which open their account", async () => {
    session.user = {
      uid: "u1",
      name: "Wednesday Addams",
      email: "wednesday@example.com",
      emailVerified: true,
    }
    renderInEnglish(await Header())
    const account = screen.getByRole("button", { name: "Your account" })
    expect(account).toHaveTextContent("WA")
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull()
  })
})
