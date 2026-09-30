import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Loads each request's locale and messages from i18n/request.ts.
const withNextIntl = createNextIntlPlugin()

// `npm run test:e2e` builds into its own folder, so a running `next dev`
// (which uses .next) is never disturbed.
const e2e = process.env.E2E === "1"

// On every response. The Content Security Policy needs a fresh nonce per
// request, so it is set in proxy.ts instead.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  // `allow-popups` keeps Google sign-in (a Firebase popup) working.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
]

const nextConfig: NextConfig = {
  // Memoizes components automatically (React Compiler, stable in Next 16).
  reactCompiler: true,
  distDir: e2e ? ".next-e2e" : ".next",
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  async rewrites() {
    return {
      // Checked after files and fixed routes (favicon.ico, robots.txt…). A
      // leftover one-segment path with a dot (`/missing.txt`, `/.env`) would
      // be taken for a language by app/[locale]; send it where no route
      // matches, so the server-rendered 404 (app/global-not-found.tsx)
      // answers.
      afterFiles: [
        { source: "/:file([^/]*\\.[^/]*)", destination: "/_/unknown/:file" },
      ],
    }
  },
}

export default withNextIntl(nextConfig)
