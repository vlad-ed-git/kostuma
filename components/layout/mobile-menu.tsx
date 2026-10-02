"use client"

import { Dialog } from "@base-ui/react/dialog"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import { useTranslations } from "next-intl"
import { useEffect, useState, type CSSProperties } from "react"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { LanguageLinks } from "@/components/language/language-links"
import { Button, buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

import { sections } from "./nav"
import { Wordmark } from "./wordmark"

// Tailwind's `lg`: from here on the header shows the full navigation.
const WIDE = "(min-width: 64rem)"

/**
 * The navigation on small screens (spec §10.2): a full-screen overlay.
 * Base UI's dialog traps focus, closes on Escape, returns focus to the menu
 * button and locks the page's scroll.
 */
export function MobileMenu({
  signedIn,
  className,
}: {
  /** Account and Sign out at the bottom, else Sign in. */
  signedIn: boolean
  className?: string
}) {
  const t = useTranslations("Nav")
  const account = useTranslations("Account")
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // Rotating a tablet can make the screen wide: the overlay has no place there.
  useEffect(() => {
    const wide = window.matchMedia(WIDE)
    const onChange = () => {
      if (wide.matches) setOpen(false)
    }
    wide.addEventListener("change", onChange)
    return () => wide.removeEventListener("change", onChange)
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={<Button variant="ghost" size="icon-lg" className={className} />}
        aria-label={t("openMenu")}
      >
        <RiMenuLine aria-hidden="true" className="size-6" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/96 transition-opacity duration-300 ease-heavy data-ending-style:opacity-0 data-ending-style:duration-200 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="group/menu fixed inset-0 z-50 flex flex-col overflow-y-auto px-4 pb-8 transition-opacity duration-300 ease-heavy data-ending-style:opacity-0 data-ending-style:duration-200 data-starting-style:opacity-0 motion-reduce:transition-none sm:px-6">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Dialog.Title className="sr-only">{t("menu")}</Dialog.Title>
            <Link
              href="/"
              onClick={close}
              className="flex min-h-11 items-center"
            >
              <Wordmark />
            </Link>
            <Dialog.Close
              render={<Button variant="ghost" size="icon-lg" />}
              aria-label={t("closeMenu")}
            >
              <RiCloseLine aria-hidden="true" className="size-6" />
            </Dialog.Close>
          </div>

          <nav aria-label={t("label")} className="mt-10">
            <ul className="flex flex-col gap-1">
              {sections.map((item, index) => (
                <li
                  key={item.label}
                  style={{ "--i": index } as CSSProperties}
                  // Each link fades up after the one before (60 ms stagger).
                  className="transition-[opacity,translate] delay-[calc(var(--i)*60ms+100ms)] duration-700 ease-dread group-data-ending-style/menu:delay-0 group-data-starting-style/menu:translate-y-3 group-data-starting-style/menu:opacity-0 motion-reduce:transition-none"
                >
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex min-h-11 items-center gap-3 py-2 font-heading text-h2"
                  >
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <LanguageLinks />
            {signedIn ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/account"
                  onClick={close}
                  className={buttonVariants({ variant: "ghost", size: "lg" })}
                >
                  {account("account")}
                </Link>
                <SignOutButton onSignOut={close} />
              </div>
            ) : (
              <Link
                href="/sign-in"
                onClick={close}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
