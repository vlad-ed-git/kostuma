"use client"

import { useTranslations } from "next-intl"
import { startTransition, useActionState, useRef } from "react"

import {
  CheckboxField,
  FormAlert,
  PasswordField,
  SubmitButton,
  TextField,
  submitTo,
  useFocusOnError,
  type FormState,
} from "@/components/form/fields"
import { Field, FieldError } from "@/components/ui/field"
import { register } from "@/lib/auth/actions"
import { signInWithPassword, type BrowserSignIn } from "@/lib/auth/browser"
import { AuthErrorCodes } from "@/lib/auth/fireAuthError"
import {
  fieldErrorsOf,
  fieldsOf,
  registerSchema,
  type RegisterInput,
} from "@/lib/auth/schemas"

import { TermsLabel } from "./terms-label"
import { TermsStep } from "./terms-step"
import { GoogleButton } from "./google-button"
import { OrDivider } from "./or-divider"
import { Recaptcha, type RecaptchaHandle } from "./recaptcha"
import { useSignIn } from "./use-sign-in"

type State = FormState<RegisterInput>

/**
 * Register (spec §11.5): Google, or a name, email, password, the terms
 * agreed to and the robot check. Once the account exists, the browser
 * signs in with it and the session starts.
 */
export function RegisterForm({
  next,
  recaptchaSiteKey,
}: {
  next: string
  recaptchaSiteKey: string
}) {
  const t = useTranslations("Auth")
  const errors = useTranslations("AuthErrors")
  const form = useRef<HTMLFormElement>(null)
  const recaptcha = useRef<RecaptchaHandle>(null)
  const { locale, termsFor, finish, openGoogle, afterGoogle } = useSignIn(next)

  const [state, dispatch, pending] = useActionState(
    async (_: State, formData: FormData): Promise<State> => {
      const fields = fieldsOf(formData, [
        "name",
        "email",
        "password",
        "confirmPassword",
        "terms",
        "g-recaptcha-response",
      ])
      const input: RegisterInput = {
        name: fields.name,
        email: fields.email,
        password: fields.password,
        confirmPassword: fields.confirmPassword,
        terms: fields.terms as RegisterInput["terms"],
        recaptcha: fields["g-recaptcha-response"],
      }
      const parsed = registerSchema.safeParse(input)
      if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

      const created = await register(input, locale)
      if (!created.ok) {
        // The server has used up this tick.
        recaptcha.current?.reset()
        return { error: created.error, fieldErrors: created.fieldErrors }
      }
      const signedIn = await signInWithPassword(
        parsed.data.email,
        parsed.data.password
      )
      if ("error" in signedIn) return { error: AuthErrorCodes.ACCOUNT_READY }
      const { error } = await finish(signedIn.idToken)
      return { error: error && AuthErrorCodes.ACCOUNT_READY }
    },
    {}
  )
  const [googleState, continueWithGoogle, googlePending] = useActionState(
    (_: State, popup: Promise<BrowserSignIn>) =>
      afterGoogle(popup) as Promise<State>,
    {}
  )
  useFocusOnError(form, state)
  const fieldErrors = state.fieldErrors

  if (termsFor) return <TermsStep onConfirm={() => finish(termsFor, true)} />

  return (
    <div className="flex flex-col gap-8">
      <GoogleButton
        pending={googlePending}
        onClick={() => {
          // Opened in the click itself: a window opened later is blocked.
          const popup = openGoogle()
          startTransition(() => continueWithGoogle(popup))
        }}
      />
      <FormAlert error={googleState.error} />
      <OrDivider />
      <form ref={form} noValidate onSubmit={submitTo(dispatch)}>
        <fieldset
          disabled={pending || googlePending}
          className="flex min-w-0 flex-col gap-6"
        >
          <TextField
            name="name"
            label={t("name")}
            autoComplete="name"
            required
            maxLength={50}
            error={fieldErrors?.name}
          />
          <TextField
            name="email"
            label={t("email")}
            type="email"
            autoComplete="email"
            required
            error={fieldErrors?.email}
          />
          <PasswordField
            name="password"
            label={t("password")}
            hint={t("passwordHint")}
            autoComplete="new-password"
            required
            error={fieldErrors?.password}
          />
          <PasswordField
            name="confirmPassword"
            label={t("confirmPassword")}
            autoComplete="new-password"
            required
            error={fieldErrors?.confirmPassword}
          />
          <CheckboxField
            name="terms"
            label={<TermsLabel />}
            error={fieldErrors?.terms}
          />
          <Field data-invalid={fieldErrors?.recaptcha ? true : undefined}>
            <Recaptcha
              ref={recaptcha}
              siteKey={recaptchaSiteKey}
              locale={locale}
            />
            {fieldErrors?.recaptcha && (
              <FieldError>{errors(fieldErrors.recaptcha)}</FieldError>
            )}
          </Field>
          <FormAlert error={state.error} />
          <SubmitButton
            pending={pending}
            label={t("createAccount")}
            pendingLabel={t("creatingAccount")}
          />
        </fieldset>
      </form>
    </div>
  )
}
