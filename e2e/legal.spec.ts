import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "./console"

const footer = (page: Page) => page.getByRole("contentinfo")
const main = (page: Page) => page.getByRole("main")

test.describe("the fine print", () => {
  for (const [link, path, title] of [
    ["Terms of service", "/terms", "Terms of service"],
    ["Privacy policy", "/privacy", "Privacy policy"],
  ] as const) {
    test(`${title} opens from the footer`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto("/")
      const finePrint = footer(page).getByRole("navigation", {
        name: "Fine print",
      })
      await expect(finePrint.getByText("Soon")).toHaveCount(0)
      await finePrint.getByRole("link", { name: link }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page).toHaveTitle(`${title} · Kostuma`)
      await expect(
        main(page).getByRole("heading", { level: 1, name: title })
      ).toBeVisible()
      await expect(
        main(page).getByText("Last updated October 4, 2026")
      ).toBeVisible()
      expect(errors).toEqual([])
    })
  }

  test("the contents lead to each section", async ({ page, isMobile }) => {
    test.skip(isMobile, "The contents sit beside the text from `lg`.")
    await page.goto("/privacy")
    const contents = page.getByRole("navigation", { name: "Contents" })
    await contents.getByRole("link", { name: "Your rights" }).click()
    await expect(page).toHaveURL(/\/privacy#rights$/)
    const heading = page.getByRole("heading", { level: 2, name: "Your rights" })
    await expect(heading).toBeInViewport()
    // Below the header, never under it.
    const top = await heading.evaluate(
      (element) => element.getBoundingClientRect().top
    )
    expect(top).toBeGreaterThanOrEqual(64)
  })

  test("names the email to write to, as a link", async ({ page }) => {
    await page.goto("/privacy")
    const email = main(page)
      .getByRole("link", { name: "vlad.atwok@gmail.com" })
      .first()
    await expect(email).toHaveAttribute("href", "mailto:vlad.atwok@gmail.com")
  })

  test("speaks the page's language", async ({ page }) => {
    await page.goto("/es/terms")
    await expect(page).toHaveTitle("Términos del servicio · Kostuma")
    await expect(
      main(page).getByRole("heading", {
        level: 2,
        name: "Quién puede usar Kostuma",
      })
    ).toBeVisible()
    await page.goto("/zh/privacy")
    await expect(page).toHaveTitle("隐私政策 · Kostuma")
    await expect(
      main(page).getByRole("heading", { level: 2, name: "你的权利" })
    ).toBeAttached()
  })

  test("the register form's links reach both pages", async ({ page }) => {
    await page.goto("/register")
    for (const [name, title] of [
      ["Terms of service", "Terms of service · Kostuma"],
      ["Privacy policy", "Privacy policy · Kostuma"],
    ]) {
      const opened = page.waitForEvent("popup")
      await main(page).getByRole("link", { name }).click()
      const tab = await opened
      await expect(tab).toHaveTitle(title)
      await tab.close()
    }
  })

  test("fits the screen", async ({ page }) => {
    for (const path of ["/terms", "/privacy", "/zh/privacy"]) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
})
