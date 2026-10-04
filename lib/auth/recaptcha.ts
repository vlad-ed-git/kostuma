import "server-only"

import { siteUrl } from "@/lib/site"

const verifyUrl = "https://www.google.com/recaptcha/api/siteverify"

/**
 * The hosts a pass may have been earned on (Google's answer names it):
 * Kostuma's; away from production, the deployment's own and localhost;
 * and Google's test key's "testkey.google.com" in the test builds only. A
 * token solved on someone else's page with Kostuma's public site key is
 * refused (todo SEC-09).
 */
export function recaptchaHosts(
  env: Record<string, string | undefined> = process.env
) {
  const hosts = new Set([siteUrl().hostname])
  if (env.VERCEL_ENV !== "production") {
    hosts.add("localhost")
    hosts.add("127.0.0.1")
    for (const url of [env.VERCEL_URL, env.VERCEL_BRANCH_URL])
      if (url) hosts.add(url.replace(/:\d+$/, ""))
  }
  if (env.E2E) hosts.add("testkey.google.com")
  return hosts
}

/**
 * Asks Google whether a reCAPTCHA token is a real pass, earned on one of
 * Kostuma's hosts. Each token passes once, within two minutes of the tick.
 * Anything else, Google unreachable or slow included, is a fail (closed).
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
    if (typeof result !== "object" || result === null) return false
    const { success, hostname } = result as Record<string, unknown>
    return (
      success === true &&
      typeof hostname === "string" &&
      recaptchaHosts().has(hostname)
    )
  } catch {
    return false
  }
}
