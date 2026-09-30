"use client"

import { Menu } from "@base-ui/react/menu"
import { RiArrowDownSLine, RiCheckLine, RiGlobalLine } from "@remixicon/react"
import { useLocale, useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import { languageTags, routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

import { endonyms } from "./languages"

/**
 * The header's language menu (spec §10.1): the current language opens a
 * list of the others. Each is a link to this same page in that language
 * (with hreflang), so it reports its navigation to the cue mark like any
 * link. Base UI handles arrow keys, type-ahead, Escape and focus return.
 */
export function LanguageMenu({ className }: { className?: string }) {
  const t = useTranslations("Language")
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <Menu.Root>
      <Menu.Trigger
        // "Language: English". A message, as punctuation differs by language.
        aria-label={t("current", { language: endonyms[locale] })}
        className={cn(
          "group/language inline-flex h-11 items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground data-popup-open:text-foreground",
          className
        )}
      >
        <RiGlobalLine aria-hidden="true" className="size-4 shrink-0" />
        <span lang={languageTags[locale]}>{endonyms[locale]}</span>
        <RiArrowDownSLine
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-heavy group-data-popup-open/language:rotate-180 motion-reduce:transition-none"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className="min-w-56 origin-(--transform-origin) border border-border bg-card py-2 transition-[opacity,translate] duration-200 ease-dread outline-none data-ending-style:opacity-0 data-ending-style:duration-100 data-starting-style:-translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none">
            <Menu.Group>
              <Menu.GroupLabel className="px-4 pt-1 pb-2 font-mono text-micro text-muted-foreground uppercase">
                {t("label")}
              </Menu.GroupLabel>
              {routing.locales.map((option) => {
                const current = option === locale
                return (
                  <Menu.LinkItem
                    key={option}
                    closeOnClick
                    render={
                      <Link
                        href={pathname}
                        locale={option}
                        hrefLang={languageTags[option]}
                        lang={languageTags[option]}
                        aria-current={current ? "true" : undefined}
                      />
                    }
                    className={cn(
                      "relative flex min-h-11 items-center justify-between gap-6 px-4 text-sm transition-colors focus-visible:-outline-offset-2",
                      // A blood-red bar marks the highlighted row, like a
                      // splice mark on the edge of the film.
                      "before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:bg-blood before:opacity-0 before:transition-opacity data-highlighted:bg-muted data-highlighted:before:opacity-100",
                      current ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {endonyms[option]}
                    {current && (
                      <RiCheckLine
                        aria-hidden="true"
                        className="size-4 text-blood-text"
                      />
                    )}
                  </Menu.LinkItem>
                )
              })}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
