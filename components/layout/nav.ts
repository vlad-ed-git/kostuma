/**
 * The places to go (spec §10.2), in the order of the flow: browse the
 * costumes, then My Pumpkin Basket, which holds the Fitting Room and the
 * way to buy. Only places are menu items, never actions. The labels are
 * keys of the `Nav` messages.
 */
export const sections = [
  { href: "/costumes", label: "costumes" },
  { href: "/basket", label: "basket" },
] as const
