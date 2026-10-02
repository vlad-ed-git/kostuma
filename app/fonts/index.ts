import localFont from "next/font/local"

import { cn } from "@/lib/utils"

// Kostuma's two faces (docs/design-spec.md §4), shipped with the app: the
// files sit here, so nothing is fetched from Google when the app builds,
// runs in development or serves a page. Each is the official variable font
// (google/fonts, SIL Open Font License: the OFL-*.txt files) subset to Latin
// and Latin Extended, with the OpenType features Google Fonts keeps.
// Shared by the root layout and the global 404 page, which renders its own
// <html>. globals.css turns the variables into `font-heading` and
// `font-sans` (with the system Chinese fonts appended).

/** Titles and names: a gothic face, like the titles of 80s slashers. */
const grenzeGotisch = localFont({
  src: "./grenze-gotisch.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-grenze-gotisch",
  // A serif stand-in with the same metrics while the file loads: no shift.
  adjustFontFallback: "Times New Roman",
})

/** Everything read: lore, labels (in small capitals) and the interface. */
const crimsonPro = localFont({
  src: [
    { path: "./crimson-pro.woff2", weight: "200 900", style: "normal" },
    { path: "./crimson-pro-italic.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-crimson-pro",
  adjustFontFallback: "Times New Roman",
})

/** Classes for <html>: the font variables and the dark-only theme. */
export const documentClassName = cn(
  "dark font-sans antialiased",
  grenzeGotisch.variable,
  crimsonPro.variable
)
