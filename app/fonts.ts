import { Crimson_Pro, Grenze_Gotisch } from "next/font/google"

import { cn } from "@/lib/utils"

// Kostuma's two faces (docs/design-spec.md §4), self-hosted by next/font.
// Shared by the root layout and the global 404 page, which renders its own
// <html>. globals.css turns the variables into `font-heading` and
// `font-sans` (with the system Chinese fonts appended).

/** Titles and names: a gothic face, like the titles of 80s slashers. */
const grenzeGotisch = Grenze_Gotisch({
  subsets: ["latin", "latin-ext"],
  variable: "--font-grenze-gotisch",
})

/** Everything read: lore, labels (in small capitals) and the interface. */
const crimsonPro = Crimson_Pro({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-crimson-pro",
})

/** Classes for <html>: the font variables and the dark-only theme. */
export const documentClassName = cn(
  "dark font-sans antialiased",
  grenzeGotisch.variable,
  crimsonPro.variable
)
