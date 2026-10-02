import { z } from "@/lib/zod"

import { AuthErrorCodes as E } from "./fireAuthError"

/**
 * The account forms' rules, shared by the browser (instant feedback) and
 * the server (the check that counts). Each message is a code, translated by
 * the form (`AuthErrors` in messages/*.json), never words of its own.
 */

const email = z
  .string()
  .trim()
  .min(1, E.EMAIL_REQUIRED)
  .max(254, E.INVALID_EMAIL)
  .pipe(z.email(E.INVALID_EMAIL))

/** A ticked checkbox ("on"), or `true`. */
const ticked = (code: E) =>
  z.union([z.literal("on"), z.literal(true)], { error: code })

export const signInSchema = z.object({
  email,
  password: z.string().min(1, E.PASSWORD_REQUIRED),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, E.NAME_REQUIRED).max(50, E.NAME_TOO_LONG),
    email,
    password: z
      .string()
      .min(8, E.PASSWORD_TOO_SHORT)
      .max(128, E.PASSWORD_TOO_LONG),
    confirmPassword: z.string().min(1, E.CONFIRM_REQUIRED),
    terms: ticked(E.TERMS_REQUIRED),
    recaptcha: z.string().min(1, E.ROBOT_CHECK_REQUIRED),
  })
  .refine((form) => form.password === form.confirmPassword, {
    message: E.PASSWORDS_DIFFER,
    path: ["confirmPassword"],
    // Said along with the other problems, once both are filled in.
    when: ({ value }) => {
      const form = value as { password?: unknown; confirmPassword?: unknown }
      return (
        typeof form.password === "string" &&
        typeof form.confirmPassword === "string" &&
        form.confirmPassword.length > 0
      )
    },
  })

export const resetPasswordSchema = z.object({ email })

/**
 * A first sign-in (Google, or an account made elsewhere): the terms, agreed
 * to before the account's profile exists, as on the register form.
 */
export const termsSchema = z.object({ terms: ticked(E.TERMS_REQUIRED) })

export type SignInInput = z.input<typeof signInSchema>
export type RegisterInput = z.input<typeof registerSchema>

/** One code per field: the first rule it breaks. */
export type FieldErrors<Input> = Partial<Record<keyof Input, E>>

export function fieldErrorsOf<Input>(error: z.ZodError<Input>) {
  const errors: FieldErrors<Input> = {}
  const codes = new Set<string>(Object.values(E))
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof Input
    // Only our codes: anything else zod says is English.
    errors[field] ??= codes.has(issue.message)
      ? (issue.message as E)
      : E.UNKNOWN_AUTH_ERROR
  }
  return errors
}

/** A form's fields as plain strings; anything else (a file) becomes "". */
export function fieldsOf<Field extends string>(
  formData: FormData,
  names: readonly Field[]
) {
  const fields = {} as Record<Field, string>
  for (const name of names) {
    const value = formData.get(name)
    fields[name] = typeof value === "string" ? value : ""
  }
  return fields
}
