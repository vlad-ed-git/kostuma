import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

import { routing } from "@/i18n/routing"

// Picks each request's language: the URL prefix (`/es/…`), else the visitor's
// saved choice (cookie), else their browser's languages, else English. Also
// sends hreflang alternate links for search engines.
const handleI18nRouting = createMiddleware(routing)

export function proxy(request: NextRequest) {
  return handleI18nRouting(request)
}

export const config = {
  // Pages only: not API routes, Next.js or Vercel internals, nor files (any
  // path with a dot, such as favicon.ico). Page paths must not contain dots.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
}
