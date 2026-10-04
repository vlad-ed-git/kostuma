import type { MetadataRoute } from "next"

import { themeColor } from "@/lib/design/theme"
import { SITE_NAME } from "@/lib/seo"
import messages from "@/messages/en.json"

/**
 * Kostuma on a home screen: its name, the night's colors and the blood-drop
 * icon (`npm run images` draws the icons from design/icon.svg). One for
 * every language: the name is the same, the tagline English, the default.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: messages.App.tagline,
    start_url: "/",
    display: "standalone",
    background_color: themeColor,
    theme_color: themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
