const origin = "http://next.invalid"

/**
 * Where to go after signing in: a path on this site, without its language
 * prefix (the redirect adds the visitor's). Anything else is home, so a
 * crafted `?next=//evil.example` link cannot send someone to another site.
 */
export function safeNext(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/"
  try {
    // Parsing settles tricks like "/\evil.example" the way browsers do.
    const url = new URL(value, origin)
    if (url.origin !== origin) return "/"
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return "/"
  }
}

/** An account page's path that keeps the place to return to. */
export function withNext(
  path: "/sign-in" | "/register" | "/reset-password",
  next: string
) {
  return next === "/" ? path : `${path}?next=${encodeURIComponent(next)}`
}
