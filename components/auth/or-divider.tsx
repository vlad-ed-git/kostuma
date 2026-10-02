import { useTranslations } from "next-intl"

/** "or" between Google and the form, on a hairline. */
export function OrDivider() {
  const t = useTranslations("Auth")
  return (
    <div className="flex items-center gap-4 text-micro caps text-muted-foreground">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      {t("or")}
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  )
}
