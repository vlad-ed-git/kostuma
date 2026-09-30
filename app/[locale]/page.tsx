import { useTranslations } from "next-intl"

import { LocaleSwitcher } from "@/components/locale-switcher"

// Placeholder home until the real one (hero, countdown, costumes) lands.
export default function HomePage() {
  const t = useTranslations("App")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="font-heading text-5xl font-semibold tracking-tight">
        {t("name")}
      </h1>
      <p className="max-w-md text-muted-foreground">{t("tagline")}</p>
      <LocaleSwitcher />
    </main>
  )
}
