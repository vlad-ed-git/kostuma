import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

/**
 * The 404 page when a page calls `notFound()` (e.g. an unknown costume), in
 * the visitor's language. Next 16.3 renders it in the browser; URLs that
 * match no route get app/global-not-found.tsx instead.
 */
export default function NotFoundPage() {
  const t = useTranslations("NotFound")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="max-w-md text-muted-foreground">{t("description")}</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        {t("home")}
      </Link>
    </main>
  )
}
