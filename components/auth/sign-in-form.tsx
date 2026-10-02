"use client"

import { useTranslations } from "next-intl"
import { startTransition, useActionState, useRef } from "react"

import {
  FormAlert,
  PasswordField,
  SubmitButton,
  TextField,
  submitTo,
  useFocusOnError,
  type FormState,
} from "@/components/form/fields"
import { Link } from "@/i18n/navigation"
import { signInWithPassword, type BrowserSignIn } from "@/lib/auth/browser"
import { withNext } from "@/lib/auth/next-path"
import {
  fieldErrorsOf,
  fieldsOf,
  signInSchema,
  type SignInInput,
} from "@/lib/auth/schemas"

import { TermsStep } from "./terms-step"
import { GoogleButton } from "./google-button"
import { OrDivider } from "./or-divider"
import { useSignIn } from "./use-sign-in"

type State = FormState<SignInInput>

/** Sign in (spec §11.5): Google, or an email and password. */
export function SignInForm({ next }: { next: string }) {
  const t = useTranslations("Auth")
  const form = useRef<HTMLFormElement>(null)
  const { termsFor, finish, openGoogle, afterGoogle } = useSignIn(next)

  const [state, dispatch, pending] = useActionState(
    async (_: State, formData: FormData): Promise<State> => {
      const parsed = signInSchema.safeParse(
        fieldsOf(formData, ["email", "password"])
      )
      if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }
      const signedIn = await signInWithPassword(
        parsed.data.email,
        parsed.data.password
      )
      if ("error" in signedIn) return { error: signedIn.error }
      return finish(signedIn.idToken)
    },
    {}
  )
  const [googleState, continueWithGoogle, googlePending] = useActionState(
    (_: State, popup: Promise<BrowserSignIn>) =>
      afterGoogle(popup) as Promise<State>,
    {}
  )
  useFocusOnError(form, state)

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
            name="email"
            label={t("email")}
            type="email"
            autoComplete="email"
            required
            error={state.fieldErrors?.email}
          />
          <div className="flex flex-col gap-2">
            <PasswordField
              name="password"
              label={t("password")}
              autoComplete="current-password"
              required
              error={state.fieldErrors?.password}
            />
            <Link
              href={withNext("/reset-password", next)}
              className="inline-flex min-h-11 w-fit items-center text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("forgot")}
            </Link>
          </div>
          <FormAlert error={state.error} />
          <SubmitButton
            pending={pending}
            label={t("signIn")}
            pendingLabel={t("signingIn")}
          />
        </fieldset>
      </form>
    </div>
  )
}
