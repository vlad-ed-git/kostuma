import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import { contentSecurityPolicy, createNonce } from "@/lib/security/csp"

// Picks each request's language: the URL prefix (`/es/…`), else the visitor's
// saved choice (cookie), else their browser's languages, else English. Also
// sends hreflang alternate links for search engines.
const handleI18nRouting = createMiddleware(routing)

export function proxy(request: NextRequest) {
  const csp = contentSecurityPolicy({
    nonce: createNonce(),
    dev: process.env.NODE_ENV === "development",
    https: request.nextUrl.protocol === "https:",
    authDomain: process.env.NEXT_PUBLIC_authDomain,
    emulatorHost: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST,
  })

  // Next.js reads the nonce from the request's CSP header and puts it on its
  // own scripts. next-intl copies the request headers into the request it
  // forwards, so the header must be set before it runs.
  request.headers.set("content-security-policy", csp)
  const response = handleI18nRouting(request)
  response.headers.set("content-security-policy", csp)
  return response
}

export const config = {
  // Pages only: not API routes, Next.js or Vercel internals, nor files (any
  // path with a dot, such as favicon.ico). Page paths must not contain dots.
  // Prefetches must run through here too: English pages live at `/…` only
  // after next-intl rewrites them to `/en/…`.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
}
