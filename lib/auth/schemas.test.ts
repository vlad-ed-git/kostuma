import { describe, expect, it } from "vitest"

import { AuthErrorCodes as E } from "./fireAuthError"
import {
  fieldErrorsOf,
  fieldsOf,
  registerSchema,
  resetPasswordSchema,
  signInSchema,
  termsSchema,
} from "./schemas"

const valid = {
  name: "Carrie White",
  email: "carrie@example.com",
  password: "prom night 1976",
  confirmPassword: "prom night 1976",
  terms: "on",
  recaptcha: "token",
}

const errorsOf = (schema: typeof registerSchema, input: unknown) => {
  const result = schema.safeParse(input)
  return result.success ? {} : fieldErrorsOf(result.error)
}

describe("the account forms' rules", () => {
  it("take a valid registration, trimming the name and email", () => {
    const result = registerSchema.safeParse({
      ...valid,
      name: "  Carrie White ",
      email: " carrie@example.com ",
    })
    expect(result.success && result.data.name).toBe("Carrie White")
    expect(result.success && result.data.email).toBe("carrie@example.com")
  })

  it("name every broken rule with a code, never with words", () => {
    expect(
      errorsOf(registerSchema, {
        name: " ",
        email: "carrie",
        password: "short",
        confirmPassword: "",
        terms: "",
        recaptcha: "",
      })
    ).toEqual({
      name: E.NAME_REQUIRED,
      email: E.INVALID_EMAIL,
      password: E.PASSWORD_TOO_SHORT,
      confirmPassword: E.CONFIRM_REQUIRED,
      terms: E.TERMS_REQUIRED,
      recaptcha: E.ROBOT_CHECK_REQUIRED,
    })
  })

  it("say the passwords differ along with every other problem", () => {
    expect(
      errorsOf(registerSchema, {
        ...valid,
        confirmPassword: "prom night 1977",
        terms: "",
      })
    ).toEqual({ confirmPassword: E.PASSWORDS_DIFFER, terms: E.TERMS_REQUIRED })
  })

  it("bound the name and the password", () => {
    expect(
      errorsOf(registerSchema, {
        ...valid,
        name: "x".repeat(51),
        password: "x".repeat(129),
        confirmPassword: "x".repeat(129),
      })
    ).toEqual({ name: E.NAME_TOO_LONG, password: E.PASSWORD_TOO_LONG })
  })

  it("take the terms only when ticked", () => {
    expect(termsSchema.safeParse({ terms: "on" }).success).toBe(true)
    expect(termsSchema.safeParse({ terms: true }).success).toBe(true)
    for (const terms of ["", "off", false, undefined]) {
      expect(termsSchema.safeParse({ terms }).success, String(terms)).toBe(
        false
      )
    }
  })

  it("ask for the email and password to sign in", () => {
    const result = signInSchema.safeParse({ email: "", password: "" })
    expect(result.success ? {} : fieldErrorsOf(result.error)).toEqual({
      email: E.EMAIL_REQUIRED,
      password: E.PASSWORD_REQUIRED,
    })
    expect(resetPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(
      true
    )
  })

  it("never pass on zod's own English", () => {
    const result = signInSchema.safeParse({ email: 42, password: null })
    const errors = result.success ? {} : fieldErrorsOf(result.error)
    for (const code of Object.values(errors)) {
      expect(Object.values(E)).toContain(code)
    }
  })
})

describe("fieldsOf", () => {
  it("reads strings, and anything else as empty", () => {
    const form = new FormData()
    form.set("email", "carrie@example.com")
    form.set("file", new Blob(["x"]))
    expect(fieldsOf(form, ["email", "file", "missing"])).toEqual({
      email: "carrie@example.com",
      file: "",
      missing: "",
    })
  })
})
