import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Loads each request's locale and messages from i18n/request.ts.
const withNextIntl = createNextIntlPlugin()

// `npm run test:e2e` builds into its own folder, so a running `next dev`
// (which uses .next) is never disturbed.
const e2e = process.env.E2E === "1"

const nextConfig: NextConfig = {
  // Memoizes components automatically (React Compiler, stable in Next 16).
  reactCompiler: true,
  distDir: e2e ? ".next-e2e" : ".next",
  // Next 16 removed the `eslint` option: `next build` no longer lints, so
  // `npm run lint` runs on its own (and in CI).
  typescript: {
    ignoreBuildErrors: false,
    // The build type-checks what ships, not the tests. `npm run typecheck`
    // still checks everything.
    tsconfigPath: "tsconfig.build.json",
  },
  experimental: {
    // The 404 page for URLs outside every language: app/global-not-found.tsx.
    globalNotFound: true,
  },
}

export default withNextIntl(nextConfig)
