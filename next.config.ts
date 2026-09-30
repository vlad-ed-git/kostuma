import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Loads each request's locale and messages from i18n/request.ts.
const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  // Next 16 removed the `eslint` option: `next build` no longer lints, so
  // `npm run lint` runs on its own (and in CI).
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // The 404 page for URLs outside every language: app/global-not-found.tsx.
    globalNotFound: true,
  },
}

export default withNextIntl(nextConfig)
