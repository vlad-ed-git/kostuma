"use client"

import { useTranslations } from "next-intl"
import { useActionState, useEffect, useRef } from "react"

import {
  CheckboxField,
  FormAlert,
  SubmitButton,
  submitTo,
  useFocusOnError,
  type FormState,
} from "@/components/form/fields"
import { fieldErrorsOf, fieldsOf, termsSchema } from "@/lib/auth/schemas"

import { TermsLabel } from "./terms-label"

type State = FormState<{ terms: string }>

/**
 * A first sign-in (Google, or an account made elsewhere) agrees to the
 * Terms of service and the Privacy policy before the account's profile
 * exists, as the register form does.
 */
export function TermsStep({
  onConfirm,
}: {
  onConfirm(): Promise<FormState<unknown>>
}) {
  const t = useTranslations("Auth")
  const form = useRef<HTMLFormElement>(null)
  const title = useRef<HTMLHeadingElement>(null)

  // The step replaced the form: the visitor's place moves to it.
  useEffect(() => title.current?.focus(), [])

  const [state, dispatch, pending] = useActionState(
    async (_: State, formData: FormData): Promise<State> => {
      const parsed = termsSchema.safeParse(fieldsOf(formData, ["terms"]))
      if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }
      return (await onConfirm()) as State
    },
    {}
  )
  useFocusOnError(form, state)

  return (
    <form ref={form} noValidate onSubmit={submitTo(dispatch)}>
      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-6">
        <h2
          ref={title}
          tabIndex={-1}
          className="font-heading text-h2 font-semibold outline-none"
        >
          {t("stepTitle")}
        </h2>
        <CheckboxField
          name="terms"
          label={<TermsLabel />}
          error={state.fieldErrors?.terms}
        />
        <FormAlert error={state.error} />
        <SubmitButton
          pending={pending}
          label={t("continue")}
          pendingLabel={t("continuing")}
        />
      </fieldset>
    </form>
  )
}
