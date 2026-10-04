"use client"

import { useTranslations } from "next-intl"
import { useId } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError } from "@/components/ui/field"
import { Link } from "@/i18n/navigation"

const link =
  "text-foreground underline decoration-blood underline-offset-4 transition-colors hover:text-blood-text"

/**
 * The consent to the photos' processing, on the confirm screen (todo
 * SEC-03): unticked, required to start, in the words the try-on keeps the
 * version of (lib/fitting-room/consent.ts). A legal disclosure: the one
 * place the interface names the image service. The Privacy policy opens in
 * a new tab, so the photos chosen stay as they are.
 */
export function PhotoConsent({
  agreed,
  error,
  onChange,
}: {
  agreed: boolean
  /** Start was pressed without it. */
  error: boolean
  onChange: (agreed: boolean) => void
}) {
  const t = useTranslations("FittingRoom")
  const id = useId()
  const errorId = `${id}-error`
  return (
    <Field data-invalid={error || undefined} className="max-w-[62ch]">
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          name="consent"
          checked={agreed}
          onCheckedChange={(checked) => onChange(checked)}
          aria-invalid={error || undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-[0.35em]"
        />
        <label htmlFor={id} className="cursor-pointer text-lg">
          {t.rich("confirm.consent", {
            privacy: (chunks) => (
              <Link
                href="/privacy"
                target="_blank"
                prefetch={false}
                className={link}
              >
                {chunks}
              </Link>
            ),
          })}
        </label>
      </div>
      {error && (
        <FieldError id={errorId}>{t("errors.consent_required")}</FieldError>
      )}
    </Field>
  )
}
