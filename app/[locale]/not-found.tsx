import { useTranslations } from "next-intl"

import { LostInTheDark } from "@/components/layout/lost-in-the-dark"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

/**
 * The 404 page when a page calls `notFound()` (e.g. an unknown costume), in
 * the visitor's language. Next 16.3 renders it in the browser; URLs that
 * match no route get app/global-not-found.tsx instead.
 */
export default function NotFoundPage() {
  const t = useTranslations("NotFound")

  return (
    <LostInTheDark
      code={t("code")}
      title={t("title")}
      description={t("description")}
      action={
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          {t("home")}
        </Link>
      }
    />
  )
}
