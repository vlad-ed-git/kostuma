import type { Page } from "@playwright/test"

// The shell links pages that later branches build (costumes, basket,
// sign-in, feedback…). Until they exist, Next.js' prefetches of them answer
// 404, which the browser logs. chore/release-check removes this allowance.
const pageNotBuiltYet = /Failed to load resource: .* 404 \(Not Found\)/

/**
 * Collects console errors and uncaught exceptions (CSP violations included)
 * while a test runs. Read the returned array at the end.
 */
// Google's reCAPTCHA box is Google's page in a frame; what it logs there
// (such as "requestStorageAccess: Permission denied.") is not Kostuma's.
const fromRecaptcha = (url: string) =>
  url.startsWith("https://www.google.com/recaptcha/")

export function collectErrors(page: Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !pageNotBuiltYet.test(message.text()) &&
      !fromRecaptcha(message.location().url)
    ) {
      errors.push(message.text())
    }
  })
  page.on("pageerror", (error) => errors.push(error.message))
  return errors
}
