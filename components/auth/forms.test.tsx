import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthErrorCodes as E } from "@/lib/auth/fireAuthError"
import { renderInEnglish } from "@/test/intl"

import { RegisterForm } from "./register-form"
import { ResetPasswordForm } from "./reset-password-form"
import { SignInForm } from "./sign-in-form"

const mocks = vi.hoisted(() => ({
  startSession: vi.fn(),
  register: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithGoogle: vi.fn(),
  sendResetLink: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock("@/lib/auth/actions", () => ({
  startSession: mocks.startSession,
  register: mocks.register,
}))
vi.mock("@/lib/auth/browser", () => ({
  prepareSignIn: () => {},
  signInWithPassword: mocks.signInWithPassword,
  signInWithGoogle: mocks.signInWithGoogle,
  sendResetLink: mocks.sendResetLink,
}))
// Stands in for Google's box: a ticked box adds the same form field.
vi.mock("./recaptcha", () => ({
  Recaptcha: () => (
    <input type="hidden" name="g-recaptcha-response" value="token" />
  ),
}))

beforeEach(() => {
  mocks.signInWithPassword.mockResolvedValue({ idToken: "id-token" })
  mocks.startSession.mockResolvedValue({ error: E.UNKNOWN_AUTH_ERROR })
})
afterEach(() => vi.clearAllMocks())

const terms = "I agree to the Terms of service and Privacy policy"

describe("SignInForm", () => {
  it("names the missing fields in words and starts at the first", async () => {
    renderInEnglish(<SignInForm next="/" />)
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(await screen.findByText("Enter your email.")).toBeInTheDocument()
    expect(screen.getByText("Enter your password.")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveFocus()
    expect(mocks.signInWithPassword).not.toHaveBeenCalled()
  })

  it("trades the sign-in for a session that goes on to `next`", async () => {
    renderInEnglish(<SignInForm next="/basket" />)
    await userEvent.type(screen.getByLabelText("Email"), "carrie@example.com")
    await userEvent.type(screen.getByLabelText("Password"), "prom night")
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }))
    await waitFor(() =>
      expect(mocks.startSession).toHaveBeenCalledWith(
        "id-token",
        "/basket",
        "en",
        false
      )
    )
  })

  it("says what went wrong in words, and keeps what was typed", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: E.INVALID_LOGIN_CREDENTIALS,
    })
    renderInEnglish(<SignInForm next="/" />)
    await userEvent.type(screen.getByLabelText("Email"), "carrie@example.com")
    await userEvent.type(screen.getByLabelText("Password"), "wrong")
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Wrong email or password.")
    expect(alert).toHaveFocus()
    expect(screen.getByLabelText("Email")).toHaveValue("carrie@example.com")
  })

  it("asks a first sign-in to agree to the terms, then goes on", async () => {
    mocks.startSession.mockResolvedValueOnce({ needsTerms: true })
    renderInEnglish(<SignInForm next="/" />)
    await userEvent.type(screen.getByLabelText("Email"), "new@example.com")
    await userEvent.type(screen.getByLabelText("Password"), "prom night")
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }))

    const step = await screen.findByRole("heading", { name: "One more thing" })
    await waitFor(() => expect(step).toHaveFocus())
    await userEvent.click(screen.getByRole("button", { name: "Continue" }))
    expect(
      await screen.findByText(
        "Agree to the Terms of service and Privacy policy to go on."
      )
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole("checkbox", { name: terms }))
    await userEvent.click(screen.getByRole("button", { name: "Continue" }))
    await waitFor(() =>
      expect(mocks.startSession).toHaveBeenLastCalledWith(
        "id-token",
        "/",
        "en",
        true
      )
    )
  })

  it("opens Google's window from the click, quietly if closed", async () => {
    mocks.signInWithGoogle.mockResolvedValue({ error: E.POPUP_CLOSED })
    renderInEnglish(<SignInForm next="/" />)
    await userEvent.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )
    expect(mocks.signInWithGoogle).toHaveBeenCalledWith("en")
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull())
  })

  it("shows the password on request", async () => {
    renderInEnglish(<SignInForm next="/" />)
    const password = screen.getByLabelText("Password")
    expect(password).toHaveAttribute("type", "password")
    await userEvent.click(screen.getByRole("button", { name: "Show password" }))
    expect(password).toHaveAttribute("type", "text")
    expect(
      screen.getByRole("button", { name: "Hide password" })
    ).toHaveAttribute("aria-pressed", "true")
  })
})

describe("RegisterForm", () => {
  async function fill() {
    await userEvent.type(screen.getByLabelText("Name"), "Carrie White")
    await userEvent.type(screen.getByLabelText("Email"), "carrie@example.com")
    await userEvent.type(
      screen.getByLabelText("Password", { selector: "input[name=password]" }),
      "prom night 1976"
    )
    await userEvent.type(
      screen.getByLabelText("Confirm password"),
      "prom night 1976"
    )
  }

  it("links the terms, opening in a new tab", () => {
    renderInEnglish(<RegisterForm next="/" recaptchaSiteKey="key" />)
    expect(screen.getByRole("checkbox", { name: terms })).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Terms of service" })
    ).toHaveAttribute("href", "/terms")
    expect(
      screen.getByRole("link", { name: "Privacy policy" })
    ).toHaveAttribute("target", "_blank")
  })

  it("asks for the terms before making anything", async () => {
    renderInEnglish(<RegisterForm next="/" recaptchaSiteKey="key" />)
    await fill()
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" })
    )
    expect(
      await screen.findByText(
        "Agree to the Terms of service and Privacy policy to go on."
      )
    ).toBeInTheDocument()
    expect(mocks.register).not.toHaveBeenCalled()
  })

  it("makes the account, signs in with it, and starts the session", async () => {
    mocks.register.mockResolvedValue({ ok: true })
    renderInEnglish(<RegisterForm next="/basket" recaptchaSiteKey="key" />)
    await fill()
    await userEvent.click(screen.getByRole("checkbox", { name: terms }))
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" })
    )
    await waitFor(() =>
      expect(mocks.startSession).toHaveBeenCalledWith(
        "id-token",
        "/basket",
        "en",
        false
      )
    )
    expect(mocks.register).toHaveBeenCalledWith(
      expect.objectContaining({ terms: "on", recaptcha: "token" }),
      "en"
    )
  })

  it("puts the server's answer on the field it is about", async () => {
    mocks.register.mockResolvedValue({
      ok: false,
      fieldErrors: { email: E.EMAIL_EXISTS },
    })
    renderInEnglish(<RegisterForm next="/" recaptchaSiteKey="key" />)
    await fill()
    await userEvent.click(screen.getByRole("checkbox", { name: terms }))
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" })
    )
    expect(
      await screen.findByText(
        "An account already uses this email. Sign in instead."
      )
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveFocus()
  })
})

describe("ResetPasswordForm", () => {
  it("always gives the same answer once sent", async () => {
    mocks.sendResetLink.mockResolvedValue(null)
    renderInEnglish(<ResetPasswordForm />)
    await userEvent.type(screen.getByLabelText("Email"), "anyone@example.com")
    await userEvent.click(
      screen.getByRole("button", { name: "Send reset link" })
    )
    expect(await screen.findByRole("status")).toHaveTextContent(
      "If an account uses that email, a reset link is on its way."
    )
    expect(mocks.sendResetLink).toHaveBeenCalledWith("anyone@example.com", "en")
  })
})
