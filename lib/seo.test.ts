// @vitest-environment node
import { existsSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { routing } from "@/i18n/routing"
import { getCostumes } from "@/lib/catalog"

import {
  alternatesFor,
  breadcrumbs,
  costumeList,
  homeCardIn,
  jsonLd,
  openGraphFor,
  organization,
  pathIn,
  seoFor,
  urlIn,
  website,
} from "./seo"

const site = "https://kostuma.vercel.app"

beforeEach(() => {
  // The production domain: what search engines are pointed at.
  vi.stubEnv("SITE_URL", "")
})
afterEach(() => {
  vi.unstubAllEnvs()
})

describe("a page's address", () => {
  it("is at the root in English, under its prefix in the others", () => {
    expect(pathIn("/", "en")).toBe("/")
    expect(pathIn("/terms", "en")).toBe("/terms")
    expect(pathIn("/", "es")).toBe("/es")
    expect(pathIn("/costumes/freddy-krueger", "zh")).toBe(
      "/zh/costumes/freddy-krueger"
    )
  })

  it("is absolute, on the production domain unless SITE_URL says otherwise", () => {
    expect(urlIn("/", "en")).toBe(`${site}/`)
    expect(urlIn("/terms", "es")).toBe(`${site}/es/terms`)
    vi.stubEnv("SITE_URL", "http://localhost:3100")
    expect(urlIn("/", "zh")).toBe("http://localhost:3100/zh")
  })
})

describe("a page's versions in every language", () => {
  it("are its canonical address, and one per language by hreflang", () => {
    expect(alternatesFor("/terms", "es")).toEqual({
      canonical: `${site}/es/terms`,
      languages: {
        en: `${site}/terms`,
        es: `${site}/es/terms`,
        "zh-Hans": `${site}/zh/terms`,
        "x-default": `${site}/terms`,
      },
    })
  })

  it("send everyone else to the English one", () => {
    for (const locale of routing.locales)
      expect(alternatesFor("/", locale).languages).toMatchObject({
        "x-default": `${site}/`,
      })
  })
})

describe("a shared link", () => {
  const page = {
    path: "/costumes/freddy-krueger",
    title: "Disfraz de Freddy Krueger",
    description: "Un asesino de niños.",
  }

  it("says what the page is, where, and in which language", () => {
    expect(openGraphFor("es", page)).toEqual({
      type: "website",
      siteName: "Kostuma",
      locale: "es_LA",
      alternateLocale: ["en_US", "zh_CN"],
      url: `${site}/es/costumes/freddy-krueger`,
      title: page.title,
      description: page.description,
    })
  })

  it("leaves the card to the page's own opengraph-image.tsx", () => {
    const { openGraph, twitter } = seoFor("zh", page)
    expect(openGraph).not.toHaveProperty("images")
    expect(twitter).toEqual({
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    })
  })

  it("borrows the home page's card, in its language, for a page with none", () => {
    const { openGraph, twitter } = seoFor("en", {
      path: "/terms",
      title: "Terms of service",
      homeCard: { alt: "The darkest day is coming." },
    })
    const card = {
      // Under its language, English too: proxy.ts lets the cards be.
      url: "/en/opengraph-image/card",
      width: 1200,
      height: 630,
      type: "image/png",
      alt: "The darkest day is coming.",
    }
    expect(openGraph).toMatchObject({ images: [card] })
    expect(twitter).toMatchObject({ images: [card] })
    expect(openGraph).not.toHaveProperty("description")
  })

  it("finds the home card under every language", () => {
    expect(homeCardIn("zh", "-").url).toBe("/zh/opengraph-image/card")
  })
})

/** Every address in a JSON-LD document. */
function addressesIn(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(addressesIn)
  if (!value || typeof value !== "object") return []
  return Object.entries(value).flatMap(([key, inner]) =>
    ["url", "item", "logo", "@id"].includes(key) && typeof inner === "string"
      ? [inner]
      : addressesIn(inner)
  )
}

describe("structured data", () => {
  it("names Kostuma once, for every language's site to point at", () => {
    expect(website("zh", "最黑暗的一天即将来临。")).toMatchObject({
      "@type": "WebSite",
      url: `${site}/zh`,
      inLanguage: "zh-Hans",
      publisher: { "@id": organization()["@id"] },
    })
    expect(organization()).toMatchObject({
      "@type": "Organization",
      name: "Kostuma",
      url: `${site}/`,
    })
  })

  it("draws the logo from a file the site serves", () => {
    const logo = new URL(String(organization().logo))
    expect(existsSync(`public${logo.pathname}`)).toBe(true)
  })

  it("lists the collection in its order, each costume at its address", () => {
    const costumes = getCostumes("es")
    const list = costumeList(costumes, "es", "Disfraces")
    expect(list).toMatchObject({
      "@type": "ItemList",
      name: "Disfraces",
      numberOfItems: costumes.length,
    })
    const items = list.itemListElement as { position: number; url: string }[]
    expect(items.map(({ position }) => position)).toEqual(
      costumes.map((_, index) => index + 1)
    )
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      url: `${site}/es/costumes/${costumes[0].slug}`,
      // Names stay as they are, in every language.
      name: costumes[0].name,
    })
  })

  it("leaves the page itself out of its breadcrumb's links", () => {
    expect(
      breadcrumbs([
        { name: "Disfraces", url: `${site}/es#costumes` },
        { name: "Freddy Krueger" },
      ])
    ).toEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Disfraces",
          item: `${site}/es#costumes`,
        },
        { "@type": "ListItem", position: 2, name: "Freddy Krueger" },
      ],
    })
  })

  it("is one thing, or a graph of several, in schema.org's vocabulary", () => {
    expect(jsonLd(breadcrumbs([]))).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [],
    })
    const graph = jsonLd(organization(), website("en", "-"))
    expect(graph["@context"]).toBe("https://schema.org")
    expect(graph["@graph"]).toHaveLength(2)
  })

  it("points only at Kostuma's own pages, on its domain", () => {
    const home = jsonLd(
      organization(),
      website("es", "-"),
      costumeList(getCostumes("es"), "es", "-")
    )
    const addresses = addressesIn(home)
    expect(addresses.length).toBeGreaterThan(getCostumes().length)
    for (const address of addresses) expect(new URL(address).origin).toBe(site)
  })
})
