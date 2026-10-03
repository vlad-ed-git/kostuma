import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Loads each request's locale and messages from i18n/request.ts.
const withNextIntl = createNextIntlPlugin()

// The test builds, each in its own folder, so a running `next dev` (which
// uses .next) is never disturbed:
// - E2E=1 (`npm run test:e2e`): a browser with the `e2e-session` cookie
//   counts as signed in, and nothing reaches Firebase (the `*.e2e.ts`
//   stand-ins below).
// - E2E=emulators (`npm run test:emulators`): the real thing, against the
//   local Firebase emulators.
// Neither may ever reach Vercel.
const e2e = process.env.E2E
if (
  (e2e || process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) &&
  process.env.VERCEL
) {
  throw new Error("E2E and the Firebase emulators are for local tests only.")
}
const distDir =
  e2e === "1" ? ".next-e2e" : e2e === "emulators" ? ".next-emulators" : ".next"

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

/**
 * Where the costume photos live: the `costumes/` folder of the project's
 * Storage bucket. The browser loads them through the image optimizer
 * (`/_next/image`, same origin), so the CSP needs no new host.
 */
export const costumePhotos = {
  protocol: "https",
  hostname: "firebasestorage.googleapis.com",
  port: "",
  pathname: "/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2F*",
  search: "?alt=media",
} as const

const nextConfig: NextConfig = {
  // Memoizes components automatically (React Compiler, stable in Next 16).
  reactCompiler: true,
  distDir,
  ...(e2e === "1" && {
    turbopack: {
      resolveAlias: {
        "@/lib/auth/session": "./lib/auth/session.e2e.ts",
        "@/lib/auth/browser": "./lib/auth/browser.e2e.ts",
        "@/lib/users": "./lib/users.e2e.ts",
        "@/lib/basket/firestore": "./lib/basket/firestore.e2e.ts",
        "@/lib/fitting-room/store": "./lib/fitting-room/store.e2e.ts",
        "@/lib/fitting-room/renderer": "./lib/fitting-room/renderer.e2e.ts",
        "@/lib/fitting-room/garment": "./lib/fitting-room/garment.e2e.ts",
        "@/lib/waitlist/store": "./lib/waitlist/store.e2e.ts",
      },
    },
  }),
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
  images: {
    // AVIF where the browser takes it, else WebP. Next 16 requires the
    // allowed qualities to be listed.
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    // Only the widths the layout uses (spec §15): rows 114 and 156 px,
    // thumbnails 72 px, the costume page up to 470 px, at 1× to 3×. Next
    // lists them all in every srcset, and no photo is wider than 1400 px.
    imageSizes: [96, 128, 256, 384],
    deviceSizes: [640, 828, 1080, 1400],
    // The costume photos on Firebase Storage (`npm run photos:upload`), and
    // nothing else.
    remotePatterns: [costumePhotos],
    // Storage answers directly: never follow a redirect somewhere else.
    maximumRedirects: 0,
  },
  experimental: {
    // The 404 page for URLs outside every language: app/global-not-found.tsx.
    globalNotFound: true,
    serverActions: {
      // The Fitting Room's two photos, which the browser shrinks to about
      // 1 MB each first (lib/fitting-room/photo-rules.ts); Vercel takes 4.5 MB
      // a request at most.
      bodySizeLimit: "4mb",
    },
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
