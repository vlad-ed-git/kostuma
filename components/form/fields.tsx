"use client"

import { RiEyeLine, RiEyeOffLine, RiLoader4Line } from "@remixicon/react"
import { useTranslations } from "next-intl"
import {
  startTransition,
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AuthErrorCodes } from "@/lib/auth/fireAuthError"
import type { FieldErrors } from "@/lib/auth/schemas"
import { cn } from "@/lib/utils"

/** A form's state: codes, which the fields translate (`AuthErrors`). */
export type FormState<Fields> = {
  /** About the whole form, such as a wrong password. */
  error?: AuthErrorCodes
  fieldErrors?: FieldErrors<Fields>
}

/**
 * Submits the form's data to an action. Unlike `<form action>`, React does
 * not clear the fields afterwards, so a typo can be fixed, not retyped.
 */
export function submitTo(dispatch: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => dispatch(formData))
  }
}

/**
 * After a failed submit, focus goes to the first field in error, else to the
 * form's alert (spec §12, Errors).
 */
export function useFocusOnError(
  form: RefObject<HTMLFormElement | null>,
  state: FormState<unknown>
) {
  useEffect(() => {
    if (!state.error && !state.fieldErrors) return
    const target = form.current?.querySelector<HTMLElement>(
      "[aria-invalid='true'], [data-form-alert]"
    )
    target?.focus()
  }, [form, state])
}

/** What ties a control to its label, its hint and its error. */
type ControlProps = {
  id: string
  "aria-invalid"?: true
  "aria-describedby"?: string
}

type LabelledProps = {
  label: string
  hint?: string
  error?: AuthErrorCodes
  control: (props: ControlProps) => ReactNode
}

/** A label, the control it names, a hint, and the control's error. */
function Labelled({ label, hint, error, control }: LabelledProps) {
  const t = useTranslations("AuthErrors")
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean)

  return (
    <Field data-invalid={error ? true : undefined} className="lg:gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {control({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy.join(" ") || undefined,
      })}
      {hint && !error && (
        <FieldDescription id={hintId}>{hint}</FieldDescription>
      )}
      {error && <FieldError id={errorId}>{t(error)}</FieldError>}
    </Field>
  )
}

type TextFieldProps = ComponentProps<"input"> & {
  name: string
  label: string
  hint?: string
  error?: AuthErrorCodes
}

export function TextField({ label, hint, error, ...input }: TextFieldProps) {
  return (
    <Labelled
      label={label}
      hint={hint}
      error={error}
      control={(control) => <Input {...control} {...input} />}
    />
  )
}

/** A password field with a button that shows or hides what was typed. */
export function PasswordField({
  label,
  hint,
  error,
  ...input
}: Omit<TextFieldProps, "type">) {
  const t = useTranslations("Auth")
  const [shown, setShown] = useState(false)

  return (
    <Labelled
      label={label}
      hint={hint}
      error={error}
      control={(control) => (
        <div className="relative">
          <Input
            {...control}
            {...input}
            type={shown ? "text" : "password"}
            className="pe-12"
          />
          <button
            type="button"
            aria-pressed={shown}
            aria-label={shown ? t("hidePassword") : t("showPassword")}
            aria-controls={control.id}
            onClick={() => setShown((visible) => !visible)}
            className="absolute end-0 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {shown ? (
              <RiEyeOffLine aria-hidden="true" className="size-5" />
            ) : (
              <RiEyeLine aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      )}
    />
  )
}

/** A checkbox with its label to the right, and its error under it. */
export function CheckboxField({
  name,
  label,
  error,
}: {
  name: string
  /** Words, or words with links in them. */
  label: ReactNode
  error?: AuthErrorCodes
}) {
  const t = useTranslations("AuthErrors")
  const id = useId()
  const errorId = `${id}-error`

  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="flex items-center gap-3">
        <Checkbox
          id={id}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <label htmlFor={id} className="cursor-pointer text-lg select-none">
          {label}
        </label>
      </div>
      {error && <FieldError id={errorId}>{t(error)}</FieldError>}
    </Field>
  )
}

/** A problem with the whole form, announced as soon as it shows. */
export function FormAlert({
  error,
  className,
}: {
  error?: AuthErrorCodes
  className?: string
}) {
  const t = useTranslations("AuthErrors")
  if (!error) return null
  return (
    <p
      role="alert"
      tabIndex={-1}
      data-form-alert
      className={cn(
        "border border-destructive/40 px-4 py-3 text-destructive outline-none",
        className
      )}
    >
      {t(error)}
    </p>
  )
}

/** The form's button: while it works, a spinner and the "…ing" words. */
export function SubmitButton({
  pending,
  label,
  pendingLabel,
  className,
}: {
  pending: boolean
  label: string
  pendingLabel: string
  className?: string
}) {
  return (
    <Button
      type="submit"
      size="lg"
      aria-busy={pending || undefined}
      className={cn("w-full gap-2", className)}
    >
      {pending && (
        <RiLoader4Line
          aria-hidden="true"
          className="size-4 animate-spin motion-reduce:animate-none"
        />
      )}
      {pending ? pendingLabel : label}
    </Button>
  )
}
