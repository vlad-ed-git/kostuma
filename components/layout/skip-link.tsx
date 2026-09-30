import { useTranslations } from "next-intl"

/** The first stop for keyboard users: straight past the header. */
export function SkipLink() {
  const t = useTranslations("SkipLink")

  return (
    <a
      href="#content"
      className="sr-only bg-foreground px-4 py-3 text-base caps text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-80"
    >
      {t("label")}
    </a>
  )
}
