import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site"

/**
 * Search engines may read every page, so they also see the noindex of the
 * pages that are each visitor's own; only the API is off limits.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  }
}
