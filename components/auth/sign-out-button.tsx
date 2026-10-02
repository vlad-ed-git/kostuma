"use client"

import { RiLoader4Line } from "@remixicon/react"
import { useLocale, useTranslations } from "next-intl"
import { useFormStatus } from "react-dom"

import { buttonVariants } from "@/components/ui/button"
import { endSession } from "@/lib/auth/actions"

function Submit() {
  const t = useTranslations("Account")
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={buttonVariants({ variant: "outline", size: "lg" })}
    >
      {pending && (
        <RiLoader4Line
          aria-hidden="true"
          className="size-4 animate-spin motion-reduce:animate-none"
        />
      )}
      {pending ? t("signingOut") : t("signOut")}
    </button>
  )
}

/**
 * Signs out on this device. A form, so it works before the page's scripts
 * have loaded too. (The page lets go of Firebase once the basket has:
 * components/basket/basket-provider.tsx.)
 */
export function SignOutButton({
  onSignOut,
}: {
  /** Called as it starts (the mobile menu closes). */
  onSignOut?: () => void
}) {
  const locale = useLocale()
  return (
    <form action={endSession.bind(null, locale)} onSubmit={() => onSignOut?.()}>
      <Submit />
    </form>
  )
}
