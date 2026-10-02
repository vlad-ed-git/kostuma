import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "../e2e/console"

// Real accounts on the Firebase emulators (playwright.emulators.config.ts).

const project = "demo-kostuma"
const firestore = `http://127.0.0.1:8085/v1/projects/${project}/databases/(default)/documents`
const authEmulator = `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${project}`

const password = "correct horse battery"

/** A fresh email for each test: they run side by side. */
const newEmail = () =>
  `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

/** A Firestore REST value: only the kinds these tests read. */
type Value = {
  stringValue?: string
  integerValue?: string
  booleanValue?: boolean
  nullValue?: null
  timestampValue?: string
  arrayValue?: { values?: Value[] }
  mapValue?: { fields?: Record<string, Value> }
}
type Document = { fields: Record<string, Value> }

const isNull = (value?: Value) => value !== undefined && "nullValue" in value

/** A document as the emulator holds it, past the rules ("owner"). */
async function documentAt(path: string) {
  const response = await fetch(`${firestore}/${path}`, {
    headers: { Authorization: "Bearer owner" },
  })
  return response.ok
    ? ((await response.json()) as { fields: Record<string, Value> })
    : null
}

/** The uid of the account with this email (the Auth emulator's own API). */
async function uidOf(email: string) {
  const response = await fetch(`${authEmulator}/accounts:lookup`, {
    method: "POST",
    headers: {
      Authorization: "Bearer owner",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: [email] }),
  })
  const { users = [] } = (await response.json()) as {
    users?: { localId: string }[]
  }
  return users[0]?.localId
}

const slugsIn = (basket: Document | null) =>
  (basket?.fields.slugs?.arrayValue?.values ?? []).map(
    (value) => value.stringValue
  )

const headerBasket = (page: Page) =>
  page.getByRole("banner").getByRole("link", { name: /^My Pumpkin Basket/ })

const costumes = (page: Page) => page.getByRole("region", { name: "Costumes" })

async function register(page: Page, email: string, name = "Carrie White") {
  await page.goto("/register")
  await page.getByLabel("Name").fill(name)
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByLabel("Confirm password").fill(password)
  await page
    .getByRole("checkbox", {
      name: "I agree to the Terms of service and Privacy policy",
    })
    .click()
  const box = page
    .frameLocator('iframe[title="reCAPTCHA"]')
    .locator("#recaptcha-anchor")
  await box.click()
  await expect(box).toHaveAttribute("aria-checked", "true", { timeout: 15_000 })
  await page.getByRole("button", { name: "Create account" }).click()
}

async function signIn(page: Page, email: string, secret = password) {
  await page.goto("/sign-in")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(secret)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
}

test("registering makes the account, its profile and a session", async ({
  page,
}) => {
  const errors = collectErrors(page)
  const email = newEmail()
  await register(page, email)
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Your account" })
  ).toHaveText("CW")

  const uid = await uidOf(email)
  const profile = await documentAt(`users/${uid}`)
  expect(profile?.fields.uid.stringValue).toBe(uid)
  expect(profile?.fields.name.stringValue).toBe("Carrie White")
  expect(profile?.fields.email.stringValue).toBe(email)
  expect(profile?.fields.emailVerified.booleanValue).toBe(false)
  expect(isNull(profile?.fields.photoURL)).toBe(true)
  expect(profile?.fields.provider.stringValue).toBe("password")
  expect(profile?.fields.credits.integerValue).toBe("2")
  expect(profile?.fields.locale.stringValue).toBe("en")
  expect(profile?.fields.termsAcceptedAt.timestampValue).toBeTruthy()
  // Where and on what: Playwright's desktop Chrome; no place off Vercel.
  const signUp = profile?.fields.signUp.mapValue?.fields
  expect(signUp?.device.stringValue).toBe("desktop")
  expect(signUp?.os.stringValue).toBe("Windows")
  expect(signUp?.browser.stringValue).toBe("Chrome")
  expect(isNull(signUp?.country)).toBe(true)
  // The session that followed is the first sign-in, counted after it.
  await expect
    .poll(async () => {
      const fields = (await documentAt(`users/${uid}`))?.fields
      return [
        fields?.signIns.integerValue,
        !!fields?.lastSignInAt.timestampValue,
      ]
    })
    .toEqual(["1", true])

  await page.goto("/account")
  await expect(page.getByRole("definition").first()).toHaveText("Carrie White")
  await expect(
    page.getByRole("region", { name: "The Fitting Room" })
  ).toContainText("2 free try-ons waiting")
  expect(errors).toEqual([])
})

test("an email can only be used once", async ({ page, context }) => {
  const email = newEmail()
  await register(page, email)
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
  await context.clearCookies()
  await register(page, email, "Someone Else")
  await expect(
    page.getByText("An account already uses this email. Sign in instead.")
  ).toBeVisible()
})

test("a wrong password is said in words; the right one signs in", async ({
  page,
  context,
}) => {
  const email = newEmail()
  await register(page, email)
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
  await context.clearCookies()

  await signIn(page, email, "not the password")
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Wrong email or password."
  )
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Your account" })
  ).toBeVisible({ timeout: 20_000 })
})

test("signing in goes back where the visitor was going", async ({
  page,
  context,
}) => {
  const email = newEmail()
  await register(page, email)
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
  await context.clearCookies()
  await page.goto("/account")
  await expect(page).toHaveURL(/\/sign-in\?next=%2Faccount$/)
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/account$/, { timeout: 20_000 })
})

test("My Pumpkin Basket joins the account, follows it live, and stays with it", async ({
  page,
  browser,
}) => {
  const errors = collectErrors(page)
  // A guest gathers two costumes, then registers.
  await page.goto("/")
  for (const name of ["Ghostface", "Pearl"]) {
    await costumes(page)
      .getByRole("button", { name: `Add ${name} to My Pumpkin Basket` })
      .click()
  }
  const email = newEmail()
  await register(page, email)
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
  await expect(headerBasket(page)).toHaveAccessibleName(
    "My Pumpkin Basket, 2 costumes"
  )
  const uid = await uidOf(email)
  await expect
    .poll(async () => slugsIn(await documentAt(`baskets/${uid}`)), {
      timeout: 15_000,
    })
    .toEqual(["ghostface", "pearl"])
  // The guest basket is empty now: it joined the account once.
  expect(
    await page.evaluate(() => localStorage.getItem("kostuma.basket"))
  ).toBeNull()

  // Another device, signed in to the same account, sees it and follows live.
  const laptop = await browser.newContext()
  const other = await laptop.newPage()
  await signIn(other, email)
  await expect(headerBasket(other)).toHaveAccessibleName(
    "My Pumpkin Basket, 2 costumes",
    { timeout: 20_000 }
  )
  await other.goto("/costumes/carrie-white")
  await other.getByRole("button", { name: "Add to My Pumpkin Basket" }).click()
  await expect(headerBasket(page)).toHaveAccessibleName(
    "My Pumpkin Basket, 3 costumes",
    { timeout: 15_000 }
  )
  await page.goto("/basket")
  await page
    .getByRole("button", { name: "Remove Ghostface from My Pumpkin Basket" })
    .click()
  await expect(headerBasket(other)).toHaveAccessibleName(
    "My Pumpkin Basket, 2 costumes",
    { timeout: 15_000 }
  )

  // Signing out: the device forgets it; the account keeps it.
  await page.goto("/account")
  await page.getByRole("button", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(headerBasket(page)).toHaveAccessibleName("My Pumpkin Basket")
  expect(slugsIn(await documentAt(`baskets/${uid}`))).toEqual([
    "pearl",
    "carrie-white",
  ])

  // Back in: the account's basket comes back, Ghostface does not.
  await signIn(page, email)
  await expect(headerBasket(page)).toHaveAccessibleName(
    "My Pumpkin Basket, 2 costumes",
    { timeout: 20_000 }
  )
  await laptop.close()
  expect(errors).toEqual([])
})

test("Google: a first sign-in agrees to the terms before the account is made", async ({
  page,
}) => {
  await page.goto("/sign-in")
  const popupOpens = page.waitForEvent("popup")
  await page.getByRole("button", { name: "Continue with Google" }).click()
  const popup = await popupOpens
  await popup.waitForLoadState()
  // The Auth emulator's stand-in for Google's window.
  await popup.getByText("Add new account").click()
  await popup.getByText("Auto-generate user information").click()
  await popup.getByText("Sign in with Google.com").click()

  const step = page.getByRole("heading", { name: "One more thing" })
  await expect(step).toBeFocused({ timeout: 20_000 })
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(
    page.getByText("Agree to the Terms of service and Privacy policy to go on.")
  ).toBeVisible()
  await page
    .getByRole("checkbox", {
      name: "I agree to the Terms of service and Privacy policy",
    })
    .click()
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Your account" })
  ).toBeVisible({ timeout: 20_000 })

  // The profile says the account came from Google, and counts the sign-in.
  await page.goto("/account")
  const email = await page.getByRole("definition").nth(1).textContent()
  const uid = await uidOf(email ?? "")
  const profile = await documentAt(`users/${uid}`)
  expect(profile?.fields.uid.stringValue).toBe(uid)
  expect(profile?.fields.provider.stringValue).toBe("google.com")
  expect(typeof profile?.fields.emailVerified.booleanValue).toBe("boolean")
  expect(profile?.fields.termsAcceptedAt.timestampValue).toBeTruthy()
  await expect
    .poll(async () => (await documentAt(`users/${uid}`))?.fields.signIns)
    .toEqual({ integerValue: "1" })
})

test("a reset link never tells whether the account exists", async ({
  page,
}) => {
  for (const email of [newEmail(), "nobody-here@example.com"]) {
    await page.goto("/reset-password")
    await page.getByLabel("Email").fill(email)
    await page.getByRole("button", { name: "Send reset link" }).click()
    await expect(page.getByRole("main").getByRole("status")).toHaveText(
      "If an account uses that email, a reset link is on its way."
    )
  }
})
