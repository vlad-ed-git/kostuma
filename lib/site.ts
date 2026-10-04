/** Kostuma's address in production. */
export const PRODUCTION_URL = "https://kostuma.vercel.app"

/**
 * Where Kostuma lives: SITE_URL when set (a test build serves itself on
 * localhost), else the production domain. Canonical links, the sitemap and
 * the social cards are built from it, so a copy elsewhere (a preview
 * deployment) still points search engines at the real site.
 */
export function siteUrl(): URL {
  const configured = process.env.SITE_URL
  try {
    if (configured) return new URL(configured)
  } catch {
    // A malformed SITE_URL: the production domain.
  }
  return new URL(PRODUCTION_URL)
}
