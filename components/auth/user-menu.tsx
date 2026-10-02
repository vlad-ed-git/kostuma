"use client"

import { Menu } from "@base-ui/react/menu"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { Link } from "@/i18n/navigation"
import { endSession } from "@/lib/auth/actions"
import { initials } from "@/lib/initials"
import { cn } from "@/lib/utils"

const item = cn(
  "relative flex min-h-11 w-full items-center px-4 text-lg text-muted-foreground transition-colors outline-none focus-visible:-outline-offset-2",
  // A blood-red bar marks the highlighted row, as in the language menu.
  "before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:bg-blood before:opacity-0 before:transition-opacity data-highlighted:bg-muted data-highlighted:text-foreground data-highlighted:before:opacity-100"
)

/**
 * The signed-in visitor in the header (spec §10.2): a square with their
 * initials, which opens their account and Sign out.
 */
export function UserMenu({
  name,
  email,
  className,
}: {
  name: string
  email: string
  className?: string
}) {
  const t = useTranslations("Account")
  const locale = useLocale()
  const [pending, startSignOut] = useTransition()

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={t("menu")}
        className={cn(
          "inline-flex size-11 items-center justify-center border border-field-border bg-card font-sans text-ui caps text-foreground transition-[border-color,box-shadow] hover:border-blood-text/60 hover:shadow-[0_0_24px_color-mix(in_oklch,var(--blood)_40%,transparent)] data-popup-open:border-blood-text/60",
          className
        )}
      >
        <span aria-hidden="true">{initials(name, email)}</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className="min-w-64 origin-(--transform-origin) border border-border bg-card py-2 transition-[opacity,translate] duration-200 ease-dread outline-none data-ending-style:opacity-0 data-ending-style:duration-100 data-starting-style:-translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none">
            <div className="flex flex-col px-4 pt-1 pb-3">
              {name && <span className="text-lg text-foreground">{name}</span>}
              <span className="truncate text-muted-foreground">{email}</span>
            </div>
            <Menu.LinkItem
              closeOnClick
              render={<Link href="/account" />}
              className={item}
            >
              {t("account")}
            </Menu.LinkItem>
            <Menu.Item
              disabled={pending}
              onClick={() => startSignOut(() => endSession(locale))}
              className={item}
            >
              {pending ? t("signingOut") : t("signOut")}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
