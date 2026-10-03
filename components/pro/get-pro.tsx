"use client"

import { Dialog } from "@base-ui/react/dialog"
import { RiLoader4Line } from "@remixicon/react"
import { useLocale, useTranslations } from "next-intl"
import { type FormEvent, useRef, useState, useTransition } from "react"

import { TextField } from "@/components/form/fields"
import { Button, buttonVariants } from "@/components/ui/button"
import { backdropClass, popupClass } from "@/components/ui/popup"
import { Link } from "@/i18n/navigation"
import { withNext } from "@/lib/auth/next-path"
import {
  joinWaitlist,
  updateWaitlistEmail,
  type WaitlistResult,
} from "@/lib/waitlist/actions"
import type { WaitlistSource } from "@/lib/waitlist/schema"
import { cn } from "@/lib/utils"

type Look = { variant?: "default" | "outline"; className?: string }

/**
 * "Get Kostuma Pro" (owner, 2026-10-04): no prices, a waitlist. Pressed, it
 * puts the account on the waitlist, then a pop-up says so in the owner's
 * words, with the email the waitlist will write to and Update, for another
 * (some sign in with an address they don't read). Pressed again later, the
 * same pop-up, with the email on record. Signed out, it leads to signing in
 * first (`back`: where to return): the waitlist keeps accounts.
 */
export function GetPro({
  source,
  signedIn = true,
  back = "/basket",
  variant = "default",
  className,
}: Look & {
  /** Where it is pressed. */
  source: WaitlistSource
  signedIn?: boolean
  back?: string
}) {
  const t = useTranslations("Pro")
  const locale = useLocale()
  const button = useRef<HTMLButtonElement>(null)
  // The email the waitlist has, once the account is on it.
  const [email, setEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [problem, setProblem] = useState<"signed_out" | "unknown" | null>(null)
  const [pending, startTransition] = useTransition()

  if (!signedIn) {
    return (
      <Link
        href={withNext("/sign-in", back)}
        className={buttonVariants({ variant, size: "lg", className })}
      >
        {t("get")}
      </Link>
    )
  }

  function join() {
    setProblem(null)
    startTransition(async () => {
      let result: WaitlistResult
      try {
        result = await joinWaitlist(source, locale)
      } catch {
        result = { ok: false, error: "unknown" }
      }
      if (result.ok) {
        setEmail(result.email)
        setOpen(true)
      } else {
        setProblem(result.error === "signed_out" ? "signed_out" : "unknown")
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        ref={button}
        variant={variant}
        size="lg"
        aria-busy={pending || undefined}
        disabled={pending}
        onClick={join}
        className={cn("gap-2", className)}
      >
        {pending && (
          <RiLoader4Line
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        )}
        {pending ? t("joining") : t("get")}
      </Button>
      {problem && (
        <p
          role="alert"
          className="max-w-[50ch] border border-destructive/40 px-4 py-3 text-destructive"
        >
          {t(problem === "signed_out" ? "signedOut" : "failed")}
        </p>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className={backdropClass} />
          <Dialog.Popup finalFocus={button} className={popupClass}>
            {email !== null && (
              <Joined email={email} source={source} onSaved={setEmail} />
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

/** The pop-up: the owner's words, then the email the waitlist writes to. */
function Joined({
  email,
  source,
  onSaved,
}: {
  email: string
  source: WaitlistSource
  onSaved: (email: string) => void
}) {
  const t = useTranslations("Pro")
  const locale = useLocale()
  const [draft, setDraft] = useState(email)
  const [answer, setAnswer] = useState<WaitlistResult | null>(null)
  const [pending, startTransition] = useTransition()

  function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // The same email: nothing to send.
    if (draft.trim() === email) return
    startTransition(async () => {
      let result: WaitlistResult
      try {
        result = await updateWaitlistEmail({ email: draft }, source, locale)
      } catch {
        result = { ok: false, error: "unknown" }
      }
      if (result.ok) {
        setDraft(result.email)
        onSaved(result.email)
      }
      setAnswer(result)
    })
  }

  const failed = answer?.ok === false ? answer : null
  return (
    <>
      <Dialog.Title className="font-heading text-h4 font-semibold text-balance">
        {t("added")}
      </Dialog.Title>
      <Dialog.Description className="text-body-lg text-muted-foreground">
        {t("deal")}
      </Dialog.Description>
      <form noValidate onSubmit={update} className="mt-2 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            label={t("email")}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              setAnswer(null)
            }}
            error={failed?.fieldErrors?.email}
          />
          <p role="status" className="text-muted-foreground">
            {answer?.ok ? t("updated") : ""}
          </p>
        </div>
        {failed?.error && (
          <p
            role="alert"
            className="border border-destructive/40 px-4 py-3 text-destructive"
          >
            {t(failed.error === "signed_out" ? "signedOut" : "failed")}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            variant="outline"
            size="lg"
            aria-busy={pending || undefined}
            className="gap-2"
          >
            {pending && (
              <RiLoader4Line
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            {pending ? t("updating") : t("update")}
          </Button>
          <Dialog.Close render={<Button size="lg" />}>
            {t("close")}
          </Dialog.Close>
        </div>
      </form>
    </>
  )
}
