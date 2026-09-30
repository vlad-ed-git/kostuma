import { Geist_Mono, Noto_Sans, Space_Grotesk } from "next/font/google"

import { cn } from "@/lib/utils"

// The fonts of the project's shadcn preset. Shared by the root layout and
// the global 404 page, which renders its own <html>.
const fontHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
})

const fontSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

/** Classes for <html>: the font variables and the dark-only theme. */
export const documentClassName = cn(
  "dark font-sans antialiased",
  fontHeading.variable,
  fontSans.variable,
  fontMono.variable
)
