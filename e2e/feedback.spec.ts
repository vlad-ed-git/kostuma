import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "./console"

// Everything up to Google's verdict on the tick: the test build has no
// reCAPTCHA secret of Google's test key. Sending for real, into Firestore,
// runs against the emulators: `npm run test:emulators`.

const footer = (page: Page) => page.getByRole("contentinfo")
const main = (page: Page) => page.getByRole("main")

test.describe("the feedback form", () => {
  test("opens from the footer on the kind of its link", async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    await footer(page).getByRole("link", { name: "Request a costume" }).click()
    await expect(page).toHaveURL(/\/feedback\?type=costume$/)
    await expect(page).toHaveTitle("Feedback · Kostuma")
    await expect(
      main(page).getByRole("heading", {
        level: 1,
        name: "Tell us what haunts you",
      })
    ).toBeVisible()
    await expect(
      page.getByRole("radio", { name: "Request a costume" })
    ).toBeChecked()
    await expect(page.getByLabel("Which costume should we add?")).toBeVisible()

    // Another footer link, on the page already: the form follows.
    await footer(page).getByRole("link", { name: "Report a bug" }).click()
    await expect(
      page.getByRole("radio", { name: "Report a bug" })
    ).toBeChecked()
    await expect(page.getByLabel("What went wrong?")).toBeVisible()
    expect(errors).toEqual([])
  })

  test("asks for feedback when the link names no kind", async ({ page }) => {
    await page.goto("/feedback?type=nonsense")
    await expect(
      page.getByRole("radio", { name: "Share feedback" })
    ).toBeChecked()
  })

  test("names what is missing, and starts at the message", async ({ page }) => {
    await page.goto("/feedback?type=bug")
    await page.getByLabel("Email").fill("not-an-email")
    await page.getByRole("button", { name: "Send" }).click()
    await expect(page.getByText("Write your message.")).toBeVisible()
    await expect(
      page.getByText("Enter a full email address, like you@example.com.")
    ).toBeVisible()
    await expect(
      page.getByText("Tick the “I'm not a robot” box.")
    ).toBeVisible()
    await expect(page.getByLabel("What went wrong?")).toBeFocused()

    await page.getByLabel("What went wrong?").fill("Too short")
    await page.getByRole("button", { name: "Send" }).click()
    await expect(page.getByText("Write at least 10 characters.")).toBeVisible()
  })

  test("counts the characters, and stops at 2,000", async ({ page }) => {
    await page.goto("/feedback")
    const message = page.getByLabel("What's on your mind?")
    await expect(page.getByText("0 of 2,000 characters")).toBeVisible()
    await message.fill("Boo!")
    await expect(page.getByText("4 of 2,000 characters")).toBeVisible()
    await message.fill("x".repeat(2100))
    await expect(message).toHaveValue("x".repeat(2000))
    await expect(page.getByText("2,000 of 2,000 characters")).toBeVisible()
  })

  test("chooses the kind with the keyboard", async ({ page }) => {
    await page.goto("/feedback?type=bug")
    await page.getByRole("radio", { name: "Report a bug" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(
      page.getByRole("radio", { name: "Share feedback" })
    ).toBeChecked()
    await expect(page.getByLabel("What's on your mind?")).toBeVisible()
  })

  test("speaks the page's language", async ({ page }) => {
    await page.goto("/es/feedback?type=costume")
    await expect(page).toHaveTitle("Comentarios · Kostuma")
    await expect(
      main(page).getByRole("heading", { name: "Cuéntanos qué te atormenta" })
    ).toBeVisible()
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByText("Escribe tu mensaje.")).toBeVisible()
    await expect(
      page.getByText("Marca la casilla «No soy un robot».")
    ).toBeVisible()
  })

  test("fits the screen", async ({ page }) => {
    await page.goto("/feedback")
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
    // The three kinds side by side, each on the screen.
    for (const name of [
      "Report a bug",
      "Share feedback",
      "Request a costume",
    ]) {
      const kind = page.locator("label", {
        has: page.getByRole("radio", { name }),
      })
      await expect(kind).toBeInViewport()
    }
  })
})
