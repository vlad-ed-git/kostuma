import { expect, test } from "@playwright/test"

test.describe("security headers", () => {
  test("every page response carries them", async ({ request }) => {
    const response = await request.get("/")
    const headers = response.headers()
    expect(headers["strict-transport-security"]).toContain("max-age=")
    expect(headers["x-content-type-options"]).toBe("nosniff")
    expect(headers["x-frame-options"]).toBe("DENY")
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin")
    expect(headers["permissions-policy"]).toContain("camera=()")
    expect(headers["cross-origin-opener-policy"]).toBe(
      "same-origin-allow-popups"
    )
    expect(headers["x-powered-by"]).toBeUndefined()
  })

  test("the CSP nonce is fresh for every request", async ({ request }) => {
    const nonceOf = async () => {
      const csp = (await request.get("/")).headers()["content-security-policy"]
      return /'nonce-([^']+)'/.exec(csp ?? "")?.[1]
    }
    const [first, second] = [await nonceOf(), await nonceOf()]
    expect(first).toBeTruthy()
    expect(first).not.toBe(second)
  })

  test("every script on the page carries the nonce", async ({ request }) => {
    const response = await request.get("/")
    const nonce = /'nonce-([^']+)'/.exec(
      response.headers()["content-security-policy"] ?? ""
    )?.[1]
    const html = await response.text()
    const scripts = html.match(/<script\b[^>]*>/g) ?? []
    expect(scripts.length).toBeGreaterThan(0)
    for (const script of scripts) {
      if (/type="application\/(ld\+)?json"/.test(script)) continue
      expect(script).toContain(`nonce="${nonce}"`)
    }
  })
})

test("browsing triggers no CSP violations", async ({ page }) => {
  const violations: string[] = []
  await page.exposeFunction("reportViolation", (text: string) =>
    violations.push(text)
  )
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      // @ts-expect-error: exposed by the test above.
      window.reportViolation(`${event.violatedDirective} ${event.blockedURI}`)
    })
  })
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) {
      violations.push(message.text())
    }
  })

  await page.goto("/")
  await page.getByLabel("Language").selectOption("es")
  await expect(page).toHaveURL(/\/es$/)
  await page.goto("/zh")
  await page.goto("/no-such-page")

  expect(violations).toEqual([])
})
