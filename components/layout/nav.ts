/**
 * The costumes are a section of the home page, right below the title card,
 * not a page of their own (spec §11.1). An object, so next-intl prefixes the
 * path and keeps the hash: `/#costumes`, `/es#costumes` (a string would give
 * `/es/#costumes`).
 */
export const costumesHref = { pathname: "/", hash: "costumes" } as const

/**
 * The places to go (spec §10.2), in the order of the flow: browse the
 * costumes, then My Pumpkin Basket, which holds the Fitting Room and the
 * way to buy. Only places are menu items, never actions. The labels are
 * keys of the `Nav` messages.
 */
export const sections = [
  { href: costumesHref, label: "costumes" },
  { href: "/basket", label: "basket" },
] as const
