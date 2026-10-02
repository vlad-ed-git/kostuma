import { expect, test, type BrowserContext, type Page } from "@playwright/test"

import { collectErrors } from "./console"

// The test build fakes the session with a cookie (lib/auth/session.e2e.ts)
// and never reaches Firebase (lib/auth/browser.e2e.ts): here, every
// password is wrong and Google's window is blocked. Signing in for real
// runs against the emulators: `npm run test:emulators`.

/** Signs the browser in, as the test build's visitor, Wednesday Addams. */
const signIn = (context: BrowserContext, baseURL: string) =>
  context.addCookies([{ name: "e2e-session", value: "1", url: baseURL }])

const banner = (page: Page) => page.getByRole("banner")

test.describe("signing in", () => {
  test("names each missing field, and starts at the first", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/sign-in")
    await expect(page).toHaveTitle("Sign in · Kostuma")
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page.getByText("Enter your email.")).toBeVisible()
    await expect(page.getByText("Enter your password.")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeFocused()
    expect(errors).toEqual([])
  })

  test("says a wrong email or password in words", async ({ page }) => {
    await page.goto("/sign-in")
    await page.getByLabel("Email").fill("wednesday@example.com")
    await page.getByLabel("Password", { exact: true }).fill("not-it")
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    const alert = page.getByRole("main").getByRole("alert")
    await expect(alert).toHaveText("Wrong email or password.")
    await expect(alert).toBeFocused()
    // What was typed stays, to be fixed rather than retyped.
    await expect(page.getByLabel("Email")).toHaveValue("wednesday@example.com")
  })

  test("shows the password on request", async ({ page }) => {
    await page.goto("/sign-in")
    const password = page.getByLabel("Password", { exact: true })
    await password.fill("hunter2")
    await expect(password).toHaveAttribute("type", "password")
    await page.getByRole("button", { name: "Show password" }).click()
    await expect(password).toHaveAttribute("type", "text")
    await page.getByRole("button", { name: "Hide password" }).click()
    await expect(password).toHaveAttribute("type", "password")
  })

  test("says what to do when Google's window is blocked", async ({ page }) => {
    await page.goto("/sign-in")
    await page.getByRole("button", { name: "Continue with Google" }).click()
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Your browser blocked the Google window. Allow pop-ups for this site, then try again."
    )
  })

  test("leads to registering and to a new password, keeping the way back", async ({
    page,
  }) => {
    await page.goto("/sign-in?next=%2Fbasket")
    await expect(
      page.getByRole("link", { name: "Create an account" })
    ).toHaveAttribute("href", "/register?next=%2Fbasket")
    await page.getByRole("link", { name: "Forgot your password?" }).click()
    await expect(page).toHaveURL(/\/reset-password\?next=%2Fbasket$/)
  })

  test("never follows a way back to another site", async ({ page }) => {
    await page.goto("/sign-in?next=%2F%2Fevil.example")
    await expect(
      page.getByRole("link", { name: "Create an account" })
    ).toHaveAttribute("href", "/register")
  })

  test("is kept out of search engines", async ({ page }) => {
    for (const path of ["/sign-in", "/register", "/reset-password"]) {
      await page.goto(path)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/
      )
    }
  })
})

test.describe("registering", () => {
  test("names every rule the form breaks", async ({ page }) => {
    await page.goto("/register")
    await expect(page).toHaveTitle("Create your account · Kostuma")
    await page.getByLabel("Name").fill("Wednesday")
    await page.getByLabel("Email").fill("not-an-email")
    await page.getByLabel("Password", { exact: true }).fill("short")
    await page.getByLabel("Confirm password").fill("different")
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(
      page.getByText("Enter a full email address, like you@example.com.")
    ).toBeVisible()
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible()
    await expect(
      page.getByText(
        "Agree to the Terms of service and Privacy policy to go on."
      )
    ).toBeVisible()
    await expect(
      page.getByText("Tick the “I'm not a robot” box.")
    ).toBeVisible()
    await expect(page.getByLabel("Email")).toBeFocused()

    await page.getByLabel("Password", { exact: true }).fill("long enough")
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page.getByText("The two passwords don't match.")).toBeVisible()
  })

  test("asks to agree to the terms, which open in a new tab", async ({
    page,
  }) => {
    await page.goto("/register")
    await expect(
      page.getByRole("checkbox", {
        name: "I agree to the Terms of service and Privacy policy",
      })
    ).toBeVisible()
    for (const [name, href] of [
      ["Terms of service", "/terms"],
      ["Privacy policy", "/privacy"],
    ]) {
      const link = page.getByRole("main").getByRole("link", { name })
      await expect(link).toHaveAttribute("href", href)
      await expect(link).toHaveAttribute("target", "_blank")
    }
  })

  test("keeps the robot check's place while Google answers", async ({
    page,
  }) => {
    // Google silent: its box's place stays reserved, 304 × 78.
    await page.route("https://www.google.com/recaptcha/**", () => {})
    await page.goto("/register")
    const box = page.locator("[data-recaptcha]")
    await expect(box).toHaveCSS("height", "78px")
    expect(
      await box.evaluate((element) => element.getBoundingClientRect().width)
    ).toBeLessThanOrEqual(304)
  })

  test("says so when the robot check can't load", async ({ page }) => {
    await page.route("https://www.google.com/recaptcha/**", (route) =>
      route.abort()
    )
    await page.goto("/register")
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "The robot check couldn't load. Check your connection, then reload the page."
    )
  })
})

test.describe("a new password", () => {
  test("never tells whether an account uses the email", async ({ page }) => {
    await page.goto("/reset-password")
    await page.getByRole("button", { name: "Send reset link" }).click()
    await expect(page.getByText("Enter your email.")).toBeVisible()
    await page.getByLabel("Email").fill("nobody@example.com")
    await page.getByRole("button", { name: "Send reset link" }).click()
    await expect(page.getByRole("main").getByRole("status")).toHaveText(
      "If an account uses that email, a reset link is on its way."
    )
  })
})

test.describe("on a laptop screen", () => {
  // Each page's last line: the way to the other account page.
  const lastLines = [
    { path: "/sign-in", last: "Create an account" },
    { path: "/register", last: "Sign in" },
    { path: "/reset-password", last: "Back to sign in" },
  ]
  for (const { path, last } of lastLines) {
    test(`${path} shows the whole form without scrolling`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, "phones scroll")
      // A 1366 × 768 laptop's browser window: the smallest common desktop.
      await page.setViewportSize({ width: 1366, height: 657 })
      // Google silent: the robot check keeps its place reserved.
      await page.route("https://www.google.com/recaptcha/**", () => {})
      await page.goto(path)
      const line = page
        .getByRole("main")
        .getByRole("link", { name: last, exact: true })
      const bottom = await line.evaluate(
        (element) => element.getBoundingClientRect().bottom
      )
      expect(bottom).toBeLessThanOrEqual(657)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
    })
  }
})

test.describe("signed in", () => {
  test.beforeEach(({ context, baseURL }) => signIn(context, baseURL!))

  test("the header shows who is signed in, and leads to the account", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the menu holds the account on small screens")
    const errors = collectErrors(page)
    await page.goto("/")
    await expect(
      banner(page).getByRole("link", { name: "Sign in" })
    ).toHaveCount(0)
    const account = banner(page).getByRole("button", { name: "Your account" })
    await expect(account).toHaveText("WA")
    await account.click()
    const menu = page.getByRole("menu")
    await expect(menu).toContainText("Wednesday Addams")
    await expect(menu).toContainText("wednesday@example.com")
    await menu.getByRole("menuitem", { name: "Account" }).click()
    await expect(page).toHaveURL(/\/account$/)
    expect(errors).toEqual([])
  })

  test("the account page: who, since when, the try-ons waiting", async ({
    page,
  }) => {
    await page.goto("/account")
    await expect(page).toHaveTitle("Your account · Kostuma")
    await expect(
      page.getByRole("heading", { level: 1, name: "Your account" })
    ).toBeVisible()
    const details = page.getByRole("definition")
    await expect(details).toHaveText([
      "Wednesday Addams",
      "wednesday@example.com",
      "September 13, 2026",
    ])
    const fittingRoom = page.getByRole("region", { name: "The Fitting Room" })
    await expect(fittingRoom).toContainText("2 free try-ons waiting")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    )
  })

  test("signing out ends the session on this device", async ({
    page,
    context,
  }) => {
    await page.goto("/account")
    await page.getByRole("button", { name: "Sign out" }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(
      (await context.cookies()).some(({ name }) => name === "e2e-session")
    ).toBe(false)
    await page.goto("/account")
    await expect(page).toHaveURL(/\/sign-in\?next=%2Faccount$/)
  })

  test("the account pages send a signed-in visitor on", async ({ page }) => {
    await page.goto("/sign-in?next=%2Fbasket")
    await expect(page).toHaveURL(/\/basket$/)
    await page.goto("/register")
    await expect(page).toHaveURL(/\/$/)
  })

  test("the menu holds the account and Sign out on small screens", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "small screens only")
    await page.goto("/")
    await page.getByRole("button", { name: "Open the menu" }).click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await expect(menu.getByRole("link", { name: "Account" })).toBeVisible()
    await menu.getByRole("button", { name: "Sign out" }).click()
    await expect(
      page.getByRole("button", { name: "Open the menu" })
    ).toBeVisible()
    await page.getByRole("button", { name: "Open the menu" }).click()
    await expect(
      page
        .getByRole("dialog", { name: "Menu" })
        .getByRole("link", { name: "Sign in" })
    ).toBeVisible()
  })
})

test.describe("signed out", () => {
  test("the account page asks to sign in first, then comes back", async ({
    page,
  }) => {
    await page.goto("/account")
    await expect(page).toHaveURL(/\/sign-in\?next=%2Faccount$/)
  })

  test("Spanish pages keep the language through the redirect", async ({
    page,
  }) => {
    await page.goto("/es/account")
    await expect(page).toHaveURL(/\/es\/sign-in\?next=%2Faccount$/)
  })
})

test.describe("My Pumpkin Basket and the account", () => {
  const costumes = (page: Page) =>
    page.getByRole("region", { name: "Costumes" })
  const headerBasket = (page: Page) =>
    banner(page).getByRole("link", { name: /^My Pumpkin Basket/ })

  test("what a guest gathered joins the account; signing out empties the device", async ({
    page,
    context,
    baseURL,
  }) => {
    await page.goto("/")
    await costumes(page)
      .getByRole("button", { name: "Add Ghostface to My Pumpkin Basket" })
      .click()
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 1 costume"
    )

    await signIn(context, baseURL!)
    await page.goto("/basket")
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 1 costume"
    )
    await page.goto("/costumes/pearl")
    await page.getByRole("button", { name: "Add to My Pumpkin Basket" }).click()
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 2 costumes"
    )

    await page.goto("/account")
    await page.getByRole("button", { name: "Sign out" }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(headerBasket(page)).toHaveAccessibleName("My Pumpkin Basket")

    // Back in: the account still has both.
    await signIn(context, baseURL!)
    await page.goto("/basket")
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 2 costumes"
    )
  })
})
