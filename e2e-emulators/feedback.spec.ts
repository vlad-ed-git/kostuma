import { expect, test } from "@playwright/test"

import { collectErrors } from "../e2e/console"

// A message sent for real: Google's test reCAPTCHA and the Firestore
// emulator (playwright.emulators.config.ts).

const firestore =
  "http://127.0.0.1:8085/v1/projects/demo-kostuma/databases/(default)/documents"

type Value = {
  stringValue?: string
  nullValue?: null
  timestampValue?: string
}

/** The feedback documents holding `message`, past the rules ("owner"). */
async function feedbackWith(message: string) {
  const response = await fetch(`${firestore}:runQuery`, {
    method: "POST",
    headers: {
      Authorization: "Bearer owner",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "feedback" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "message" },
            op: "EQUAL",
            value: { stringValue: message },
          },
        },
      },
    }),
  })
  const results = (await response.json()) as {
    document?: { fields: Record<string, Value> }
  }[]
  return results.flatMap((result) => (result.document ? [result.document] : []))
}

test("a message lands in Firestore, as typed", async ({ page }) => {
  const errors = collectErrors(page)
  const message = `Please add the Babadook. (${Date.now()})`

  await page.goto("/feedback?type=costume")
  await page.getByLabel("Which costume should we add?").fill(`  ${message}  `)
  await page.getByLabel("Email").fill("amelia@example.com")
  const box = page
    .frameLocator('iframe[title="reCAPTCHA"]')
    .locator("#recaptcha-anchor")
  await box.click()
  await expect(box).toHaveAttribute("aria-checked", "true", { timeout: 15_000 })
  await page.getByRole("button", { name: "Send" }).click()

  const received = page.getByRole("heading", { name: "Received." })
  await expect(received).toBeVisible({ timeout: 15_000 })
  await expect(received).toBeFocused()

  const [feedback, ...more] = await feedbackWith(message)
  expect(more).toEqual([])
  expect(feedback.fields.kind.stringValue).toBe("costume")
  expect(feedback.fields.email.stringValue).toBe("amelia@example.com")
  expect(feedback.fields.uid).toEqual({ nullValue: null })
  expect(feedback.fields.locale.stringValue).toBe("en")
  expect(feedback.fields.device.stringValue).toBe("desktop")
  expect(feedback.fields.browser.stringValue).toMatch(/Chrome/)
  expect(feedback.fields.createdAt.timestampValue).toBeTruthy()
  // Nothing else: no address, no raw user agent.
  expect(Object.keys(feedback.fields).sort()).toEqual([
    "browser",
    "createdAt",
    "device",
    "email",
    "kind",
    "locale",
    "message",
    "os",
    "uid",
  ])

  // Another, on a fresh form.
  await page.getByRole("button", { name: "Send another" }).click()
  await expect(page.getByLabel("Which costume should we add?")).toHaveValue("")
  expect(errors).toEqual([])
})
