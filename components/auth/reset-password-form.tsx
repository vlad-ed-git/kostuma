"use client"

import { useLocale, useTranslations } from "next-intl"
import { useActionState, useEffect, useRef } from "react"

import {
  FormAlert,
  SubmitButton,
  TextField,
  submitTo,
  useFocusOnError,
  type FormState,
} from "@/components/form/fields"
import { prepareSignIn, sendResetLink } from "@/lib/auth/browser"
import {
  fieldErrorsOf,
  fieldsOf,
  resetPasswordSchema,
} from "@/lib/auth/schemas"

type State = FormState<{ email: string }> & { sent?: true }

/**
 * Reset password (spec §11.5): always the same answer once sent, so the
 * page never tells whether an account uses an email.
 */
export function ResetPasswordForm() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => prepareSignIn(), [])

  const [state, dispatch, pending] = useActionState(
    async (_: State, formData: FormData): Promise<State> => {
      const parsed = resetPasswordSchema.safeParse(
        fieldsOf(formData, ["email"])
      )
      if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }
      const problem = await sendResetLink(parsed.data.email, locale)
      return problem ? { error: problem } : { sent: true }
    },
    {}
  )
  useFocusOnError(form, state)

  if (state.sent) {
    return (
      <p role="status" className="text-lead">
        {t("linkSent")}
      </p>
    )
  }

  return (
    <form ref={form} noValidate onSubmit={submitTo(dispatch)}>
      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-6">
        <TextField
          name="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          required
          error={state.fieldErrors?.email}
        />
        <FormAlert error={state.error} />
        <SubmitButton
          pending={pending}
          label={t("sendLink")}
          pendingLabel={t("sending")}
        />
      </fieldset>
    </form>
  )
}
