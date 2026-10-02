"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { documentClassName } from "@/app/fonts"
import { Stumbled } from "@/components/layout/stumbled"
import { buttonVariants } from "@/components/ui/button"
import { messagesFor } from "@/i18n/messages"
import { languageTags, localeOfPath, routing } from "@/i18n/routing"
import en from "@/messages/en.json"

import "./globals.css"

/**
 * When the site's shell itself breaks (the layout: header, basket, footer),
 * this replaces the whole document, outside next-intl. It still speaks the
 * page's language: English at once, the others as soon as they load.
 */
export default function GlobalError({ retry }: { retry: () => void }) {
  const locale = localeOfPath(usePathname())
  const [text, setText] = useState(en.Error)

  useEffect(() => {
    if (locale === routing.defaultLocale) return
    let current = true
    messagesFor(locale).then(
      (messages) => {
        if (current) setText(messages.Error)
      },
      // Unreachable language: English stays.
      () => {}
    )
    return () => {
      current = false
    }
  }, [locale])

  const home = locale === routing.defaultLocale ? "/" : `/${locale}`

  return (
    <html lang={languageTags[locale]} className={documentClassName}>
      <body className="flex min-h-svh flex-col">
        <main id="content" className="flex-1">
          <Stumbled
            title={text.title}
            description={text.description}
            retry={text.retry}
            onRetry={retry}
            // A full load: the shell broke, so start it afresh.
            home={
              <a
                href={home}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                {text.home}
              </a>
            }
          />
        </main>
      </body>
    </html>
  )
}
