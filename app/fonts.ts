import { Courier_Prime, League_Gothic, Libre_Franklin } from "next/font/google"

import { cn } from "@/lib/utils"

// Kostuma's three faces (docs/design-spec.md §4), self-hosted by next/font.
// Shared by the root layout and the global 404 page, which renders its own
// <html>. globals.css turns the variables into `font-heading`, `font-mono`
// and `font-sans` (with the system Chinese fonts appended).

/** Titles and, at 75 % width, the billing block. One weight. */
const leagueGothic = League_Gothic({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-league-gothic",
})

/** Case-file labels, ranks and years: the screenplay Courier. */
const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier-prime",
})

/** Body text and UI. */
const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-libre-franklin",
})

/** Classes for <html>: the font variables and the dark-only theme. */
export const documentClassName = cn(
  "dark font-sans antialiased",
  leagueGothic.variable,
  courierPrime.variable,
  libreFranklin.variable
)
