"use client"

import { RiCheckboxCircleLine } from "@remixicon/react"
import { useLocale, useTranslations } from "next-intl"
import { useActionState, useEffect, useRef, useState } from "react"

import { Recaptcha, type RecaptchaHandle } from "@/components/auth/recaptcha"
import {
  FormAlert,
  SubmitButton,
  TextAreaField,
  TextField,
  submitTo,
  useFocusOnError,
  type FormState,
} from "@/components/form/fields"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { fieldErrorsOf, fieldsOf } from "@/lib/auth/schemas"
import { sendFeedback } from "@/lib/feedback/actions"
import {
  feedbackKinds,
  feedbackSchema,
  MESSAGE_MAX,
  type FeedbackInput,
  type FeedbackKind,
} from "@/lib/feedback/schema"
import { cn } from "@/lib/utils"

type State = FormState<FeedbackInput>

/**
 * The feedback form (spec §11.7), on the kind a link asked for. Once a
 * message is kept, the thanks take the form's place; "Send another" brings
 * a fresh form back, on the kind just used.
 */
export function Feedback({
  kind,
  recaptchaSiteKey,
}: {
  kind: FeedbackKind
  recaptchaSiteKey: string
}) {
  const [sent, setSent] = useState(false)
  const [lastKind, setLastKind] = useState(kind)
  // A new form each time: nothing of the message sent is left in it.
  const [round, setRound] = useState(0)

  if (sent) {
    return (
      <Received
        onAgain={() => {
          setSent(false)
          setRound((count) => count + 1)
        }}
      />
    )
  }
  return (
    <FeedbackForm
      key={round}
      kind={lastKind}
      recaptchaSiteKey={recaptchaSiteKey}
      focusMessage={round > 0}
      onSent={(kind) => {
        setLastKind(kind)
        setSent(true)
      }}
    />
  )
}

function FeedbackForm({
  kind: firstKind,
  recaptchaSiteKey,
  focusMessage,
  onSent,
}: {
  kind: FeedbackKind
  recaptchaSiteKey: string
  /** Back from "Send another": straight to the message. */
  focusMessage: boolean
  onSent: (kind: FeedbackKind) => void
}) {
  const t = useTranslations("Feedback")
  const errors = useTranslations("AuthErrors")
  const locale = useLocale()
  const form = useRef<HTMLFormElement>(null)
  const recaptcha = useRef<RecaptchaHandle>(null)
  const [kind, setKind] = useState(firstKind)
  const [length, setLength] = useState(0)

  const [state, dispatch, pending] = useActionState(
    async (_: State, formData: FormData): Promise<State> => {
      const fields = fieldsOf(formData, [
        "kind",
        "message",
        "email",
        "g-recaptcha-response",
      ])
      const input: FeedbackInput = {
        kind: fields.kind as FeedbackKind,
        message: fields.message,
        email: fields.email,
        recaptcha: fields["g-recaptcha-response"],
      }
      const parsed = feedbackSchema.safeParse(input)
      if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

      const sent = await sendFeedback(input, locale)
      if (!sent.ok) {
        // The server has used up this tick.
        recaptcha.current?.reset()
        return { error: sent.error, fieldErrors: sent.fieldErrors }
      }
      onSent(parsed.data.kind)
      return {}
    },
    {}
  )
  useFocusOnError(form, state)
  const fieldErrors = state.fieldErrors

  useEffect(() => {
    if (focusMessage) form.current?.querySelector("textarea")?.focus()
  }, [focusMessage])

  return (
    <form ref={form} noValidate onSubmit={submitTo(dispatch)}>
      <fieldset
        disabled={pending}
        className="flex min-w-0 flex-col gap-6 lg:gap-5"
      >
        <fieldset className="min-w-0">
          <legend className="sr-only">{t("kind")}</legend>
          {/* One of three, side by side like a switch; the one chosen is
              lit red. Plain radio buttons underneath. */}
          <div className="grid grid-cols-3">
            {feedbackKinds.map((each) => (
              <label
                key={each}
                className={cn(
                  "relative -ms-px flex min-h-14 cursor-pointer items-center justify-center border border-field-border px-2 py-2 text-center text-ui caps text-balance text-muted-foreground transition-[color,background-color,box-shadow] select-none first:ms-0 hover:text-foreground",
                  "has-checked:z-10 has-checked:border-blood has-checked:bg-blood/25 has-checked:text-foreground has-checked:shadow-[inset_0_-2px_0_var(--blood-text),0_0_28px_-8px_var(--blood)]",
                  "has-focus-visible:z-20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
                )}
              >
                <input
                  type="radio"
                  name="kind"
                  value={each}
                  checked={kind === each}
                  onChange={() => setKind(each)}
                  className="sr-only"
                />
                {t(`kinds.${each}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <TextAreaField
          name="message"
          label={t(`message.${kind}`)}
          hint={t(`hint.${kind}`)}
          note={t("count", { count: length, max: MESSAGE_MAX })}
          required
          maxLength={MESSAGE_MAX}
          onChange={(event) => setLength(event.currentTarget.value.length)}
          error={fieldErrors?.message}
          className="min-h-40 lg:min-h-36"
        />
        <TextField
          name="email"
          label={t("email")}
          hint={t("emailHint")}
          type="email"
          autoComplete="email"
          error={fieldErrors?.email}
        />
        {/* Desktop: the robot check and the button side by side, the
            form's problem under both (read in this order everywhere). */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[304px_minmax(0,1fr)] lg:items-center lg:gap-4">
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
          <FormAlert
            error={state.error}
            className="lg:col-span-2 lg:row-start-2"
          />
          <SubmitButton
            pending={pending}
            label={t("send")}
            pendingLabel={t("sending")}
            className="lg:col-start-2 lg:row-start-1"
          />
        </div>
      </fieldset>
    </form>
  )
}

/** In the form's place: the message is kept. */
function Received({ onAgain }: { onAgain: () => void }) {
  const t = useTranslations("Feedback")
  const heading = useRef<HTMLHeadingElement>(null)

  // Said at once to a screen reader, and where the keyboard goes on.
  useEffect(() => heading.current?.focus(), [])

  return (
    <div className="flex flex-col items-start gap-6">
      <RiCheckboxCircleLine
        aria-hidden="true"
        className="size-16 text-blood-text drop-shadow-[0_0_18px_var(--blood)]"
      />
      <div className="flex flex-col gap-3">
        <h2
          ref={heading}
          tabIndex={-1}
          className="font-heading text-h2 font-semibold outline-none"
        >
          {t("received")}
        </h2>
        <p className="text-lead text-muted-foreground">{t("thanks")}</p>
      </div>
      <Button size="lg" variant="outline" onClick={onAgain}>
        {t("again")}
      </Button>
    </div>
  )
}
