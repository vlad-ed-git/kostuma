type CspOptions = {
  /** Fresh for every request (see `createNonce`). */
  nonce: string
  /** React needs `eval` in development for server error stacks. */
  dev: boolean
  /** Upgrade subresources only when the page itself is served over HTTPS. */
  https: boolean
  /**
   * Firebase Auth's domain (e.g. `project.firebaseapp.com`): Google sign-in
   * opens a popup that talks to the page through a hidden iframe there.
   */
  authDomain?: string
}

// Firebase Auth's REST endpoints, called by the sign-in forms.
const firebaseAuth = [
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
]

// reCAPTCHA's script, the calls it makes from our page, and its frames.
const recaptcha = "https://www.google.com/recaptcha/"
const recaptchaScripts = [recaptcha, "https://www.gstatic.com/recaptcha/"]
const recaptchaFrames = [recaptcha, "https://recaptcha.google.com/recaptcha/"]

// Google's API loader, which Firebase uses for the sign-in popup.
const googleApis = "https://apis.google.com"

/**
 * Strict, nonce-based Content Security Policy. Only scripts carrying this
 * request's nonce run; with 'strict-dynamic', scripts they load are trusted
 * too (browsers without it fall back to the listed hosts). Add origins here
 * only when a feature needs them.
 */
export function contentSecurityPolicy({
  nonce,
  dev,
  https,
  authDomain,
}: CspOptions) {
  const firebaseFrame = isHostname(authDomain) ? [`https://${authDomain}`] : []

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...recaptchaScripts,
      googleApis,
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    // Server-rendered `style` attributes (animations, React style props).
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...firebaseAuth, recaptcha],
    "frame-src": [...recaptchaFrames, ...firebaseFrame],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  }

  const policy = Object.entries(directives).map(
    ([name, sources]) => `${name} ${sources.join(" ")}`
  )
  if (https) policy.push("upgrade-insecure-requests")

  return policy.join("; ")
}

/** 128 bits of randomness, base64 encoded. */
export function createNonce() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString(
    "base64"
  )
}

/** A bare host name such as `kostuma-73f77.firebaseapp.com`: nothing else. */
function isHostname(value: string | undefined): value is string {
  return (
    typeof value === "string" &&
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(
      value
    )
  )
}
