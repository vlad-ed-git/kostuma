import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SUPPORT_EMAIL } from "@/lib/legal"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import zh from "@/messages/zh.json"
import { renderInEnglish } from "@/test/intl"

import { LegalPage, sectionsOf, type LegalDocument } from "./legal-page"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock("next-intl/server", async () => {
  const { createFormatter, createTranslator } = await import("next-intl")
  const messages = (await import("@/messages/en.json")).default
  return {
    getTranslations: async (namespace: string) =>
      createTranslator({
        locale: "en",
        messages,
        namespace: namespace as never,
      }),
    // Far from UTC: the date must not slip to the day before.
    getFormatter: async () =>
      createFormatter({ locale: "en", timeZone: "Pacific/Honolulu" }),
  }
})

const documents = ["Terms", "Privacy"] as const

// jsdom drops the space inside the screen-reader-only words; browsers keep
// it.
const newTab = (name: string) =>
  new RegExp(`^${name}\\s?\\(opens in a new tab\\)$`)

async function renderDocument(document: LegalDocument) {
  return renderInEnglish(await LegalPage({ document, updated: "2026-10-03" }))
}

describe("LegalPage", () => {
  it.each([
    ["Terms", "Terms of service"],
    ["Privacy", "Privacy policy"],
  ] as const)(
    "titles %s, with the day it last changed",
    async (document, title) => {
      await renderDocument(document)
      expect(
        screen.getByRole("heading", { level: 1, name: title })
      ).toHaveClass("vhs-ghost-title")
      expect(screen.getByText(en[document].lead)).toBeInTheDocument()
      expect(
        screen.getByText("Last updated October 3, 2026")
      ).toBeInTheDocument()
    }
  )

  it.each(documents)(
    "%s: every section, in order, each in the contents",
    async (document) => {
      await renderDocument(document)
      const titles = Object.values(en[document].sections).map(
        (section) => section.title
      )
      expect(
        screen
          .getAllByRole("heading", { level: 2 })
          .map((heading) => heading.textContent)
      ).toEqual(titles)

      const contents = screen.getByRole("navigation", { name: "Contents" })
      const links = within(contents).getAllByRole("link")
      expect(links.map((link) => link.textContent)).toEqual(titles)
      for (const link of links) {
        const id = link.getAttribute("href")!.slice(1)
        expect(document_(id)).toHaveAccessibleName(link.textContent!)
      }
    }
  )

  it.each(documents)(
    "%s: no tag or argument shows as text",
    async (document) => {
      const { container } = await renderDocument(document)
      expect(container.textContent).not.toMatch(/[<>{}]/)
    }
  )

  it("links the Privacy policy, the form and the email", async () => {
    await renderDocument("Terms")
    expect(
      screen.getAllByRole("link", { name: "Privacy policy" })[0]
    ).toHaveAttribute("href", "/privacy")
    for (const form of screen.getAllByRole("link", { name: "feedback form" })) {
      expect(form).toHaveAttribute("href", "/feedback")
    }
    for (const email of screen.getAllByRole("link", { name: SUPPORT_EMAIL })) {
      expect(email).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`)
    }
  })

  it("says who runs Kostuma, and that it isn't YouCam's", async () => {
    for (const document of ["Terms", "Privacy"] as const) {
      const { unmount } = await renderDocument(document)
      expect(
        screen.getByRole("heading", { name: "Who we are" })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /made and run by its developers, a small independent team \(not a registered company\)/
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "Kostuma is not affiliated with Perfect Corp. (YouCam), which provides its AI image service."
        )
      ).toBeInTheDocument()
      unmount()
    }
  })

  it("opens other companies' policies in a new tab, and says so", async () => {
    await renderDocument("Privacy")
    const google = screen.getAllByRole("link", {
      name: newTab("Google's Privacy Policy"),
    })
    expect(google.length).toBeGreaterThan(0)
    for (const link of [
      ...google,
      screen.getByRole("link", {
        name: newTab("Terms of Service"),
      }),
      screen.getByRole("link", {
        name: newTab("Vercel's privacy policy"),
      }),
    ]) {
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
      expect(link.getAttribute("href")).toMatch(/^https:\/\//)
    }
  })
})

/** The section with this id. */
function document_(id: string) {
  return window.document.getElementById(id)
}

describe("the documents", () => {
  const tags = new Set([
    "b",
    "email",
    "terms",
    "privacy",
    "feedback",
    "google",
    "googleTerms",
    "vercel",
  ])

  it.each(documents)(
    "%s: every message is a title, a paragraph or a list",
    (document) => {
      for (const { id, blocks } of sectionsOf(document)) {
        const section = en[document].sections[
          id as keyof (typeof en)[typeof document]["sections"]
        ] as Record<string, unknown>
        expect(["title", ...blocks.map((block) => block.key)], id).toEqual(
          Object.keys(section)
        )
        expect(blocks.length, id).toBeGreaterThan(0)
      }
    }
  )

  it.each([
    ["en", en],
    ["es", es],
    ["zh", zh],
  ] as const)("%s uses only the tags the page renders", (_, messages) => {
    for (const document of documents) {
      const text = JSON.stringify(messages[document])
      for (const [, tag] of text.matchAll(/<(\w+)>/g)) {
        expect(tags, `${document}: <${tag}>`).toContain(tag)
      }
    }
  })

  it.each([
    ["en", en],
    ["es", es],
    ["zh", zh],
  ] as const)(
    "%s gives the email wherever a deletion is asked for",
    (_, messages) => {
      expect(messages.Terms.sections.closing.p1).toContain("{address}")
      expect(messages.Privacy.sections.rights.p1).toContain("{address}")
    }
  )
})
