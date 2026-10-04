// @vitest-environment node
import { describe, expect, it } from "vitest"

import { costumes } from "@/content/costumes"

import { SHOP_ORDER, SHOPS, shopLinks } from "./shops"

describe("the shops", () => {
  it("open each one's own search for the costume", () => {
    expect(
      Object.fromEntries(
        SHOP_ORDER.map((shop) => [shop, SHOPS[shop].search("Freddy Krueger")])
      )
    ).toEqual({
      halloweencostumes:
        "https://www.halloweencostumes.com/search.aspx?q=Freddy+Krueger",
      spirithalloween:
        "https://www.spirithalloween.com/catalog/search.cmd?form_state=searchForm&query=Freddy+Krueger&Search=",
      amazon: "https://www.amazon.com/s?k=Freddy+Krueger",
      etsy: "https://www.etsy.com/search?q=Freddy+Krueger",
      trickortreatstudios:
        "https://trickortreatstudios.com/search?q=Freddy+Krueger",
      ebay: "https://www.ebay.com/sch/i.html?_nkw=Freddy+Krueger",
    })
  })

  it("keep every word of a search, whatever it holds", () => {
    const url = new URL(SHOPS.amazon.search("Jennifer's Body & co. 100%"))
    expect(url.searchParams.get("k")).toBe("Jennifer's Body & co. 100%")
  })

  it("list the costume shops before the markets", () => {
    expect(SHOP_ORDER).toEqual([
      "halloweencostumes",
      "spirithalloween",
      "amazon",
      "etsy",
      "trickortreatstudios",
      "ebay",
    ])
  })

  it("name each shop as it names itself", () => {
    expect(SHOP_ORDER.map((shop) => SHOPS[shop].name)).toEqual([
      "HalloweenCostumes.com",
      "Spirit Halloween",
      "Amazon",
      "Etsy",
      "Trick or Treat Studios",
      "eBay",
    ])
  })
})

describe("a costume's shops", () => {
  it("become Buy's links, in the costume's order", () => {
    expect(
      shopLinks([
        { shop: "amazon", search: "Pearl X costume" },
        { shop: "etsy", search: "Pearl Mia Goth costume" },
      ])
    ).toEqual([
      { name: "Amazon", url: "https://www.amazon.com/s?k=Pearl+X+costume" },
      {
        name: "Etsy",
        url: "https://www.etsy.com/search?q=Pearl+Mia+Goth+costume",
      },
    ])
  })

  it("lead every costume to a secure page on its shop's own site", () => {
    const hosts = Object.fromEntries(
      SHOP_ORDER.map((shop) => [
        SHOPS[shop].name,
        new URL(SHOPS[shop].search("-")).host,
      ])
    )
    for (const costume of costumes)
      for (const { name, url } of shopLinks(costume.shops)) {
        const link = new URL(url)
        expect(link.protocol, costume.name).toBe("https:")
        expect(link.host, costume.name).toBe(hosts[name])
      }
  })
})
