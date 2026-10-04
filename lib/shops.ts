import type { ShopId, ShopLink, ShopSearch } from "@/lib/catalog/types"

/**
 * The shops Buy leads to (spec §10.3; owner, 2026-10-04: no affiliate
 * links, no deals): popular, trusted ones, each opened on its own search
 * for the costume, which outlasts any product page. A costume names only
 * the shops whose search was checked and found it (content/costumes.ts).
 */
export const SHOPS: Record<
  ShopId,
  { name: string; search: (query: string) => string }
> = {
  halloweencostumes: {
    name: "HalloweenCostumes.com",
    // Opens a character's own page when the shop has one.
    search: (query) =>
      searchUrl("https://www.halloweencostumes.com/search.aspx", { q: query }),
  },
  spirithalloween: {
    name: "Spirit Halloween",
    // What its search form sends (the field is `query` since 2026).
    search: (query) =>
      searchUrl("https://www.spirithalloween.com/catalog/search.cmd", {
        form_state: "searchForm",
        query,
        Search: "",
      }),
  },
  amazon: {
    name: "Amazon",
    search: (query) => searchUrl("https://www.amazon.com/s", { k: query }),
  },
  etsy: {
    name: "Etsy",
    search: (query) => searchUrl("https://www.etsy.com/search", { q: query }),
  },
  trickortreatstudios: {
    name: "Trick or Treat Studios",
    search: (query) =>
      searchUrl("https://trickortreatstudios.com/search", { q: query }),
  },
  ebay: {
    name: "eBay",
    search: (query) =>
      searchUrl("https://www.ebay.com/sch/i.html", { _nkw: query }),
  },
}

/** The order Buy lists the shops in: the costume shops, then the markets. */
export const SHOP_ORDER = Object.keys(SHOPS) as ShopId[]

function searchUrl(base: string, params: Record<string, string>) {
  return `${base}?${new URLSearchParams(params)}`
}

function linkTo({ shop, search }: ShopSearch): ShopLink {
  return { name: SHOPS[shop].name, url: SHOPS[shop].search(search) }
}

/** A costume's shops as Buy shows them: each one's name and search. */
export function shopLinks(
  searches: readonly [ShopSearch, ...ShopSearch[]]
): [ShopLink, ...ShopLink[]] {
  const [first, ...rest] = searches
  return [linkTo(first), ...rest.map(linkTo)]
}
