"use client"

import { useTranslations } from "next-intl"

import { Stumbled } from "@/components/layout/stumbled"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

/**
 * A page that broke, inside the site's shell and in the visitor's
 * language: never Next.js' own English message. (A broken shell gets
 * app/global-error.tsx.)
 */
export default function ErrorPage({ retry }: { retry: () => void }) {
  const t = useTranslations("Error")

  return (
    <Stumbled
      title={t("title")}
      description={t("description")}
      retry={t("retry")}
      onRetry={retry}
      home={
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {t("home")}
        </Link>
      }
    />
  )
}
