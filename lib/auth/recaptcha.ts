import "server-only"

const verifyUrl = "https://www.google.com/recaptcha/api/siteverify"

/**
 * Asks Google whether a reCAPTCHA token is a real pass. Each token passes
 * once, within two minutes of the tick. Anything else, Google unreachable
 * or slow included, is a fail (closed).
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) throw new Error("RECAPTCHA_SECRET_KEY is not set.")

  try {
    const response = await fetch(verifyUrl, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })
    if (!response.ok) return false
    const result: unknown = await response.json()
    return (
      typeof result === "object" &&
      result !== null &&
      "success" in result &&
      result.success === true
    )
  } catch {
    return false
  }
}
