import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { LegalPage } from "@/components/legal/legal-page"
import { PRIVACY_UPDATED } from "@/lib/legal"
import { seoFor } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy")
  const app = await getTranslations("App")
  const title = t("title")
  return {
    title,
    description: t("lead"),
    ...seoFor(await getLocale(), {
      path: "/privacy",
      title,
      description: t("lead"),
      homeCard: { alt: app("tagline") },
    }),
  }
}

/** The Privacy policy (spec §11.9): what Kostuma keeps, and why. */
export default function PrivacyPage() {
  return <LegalPage document="Privacy" updated={PRIVACY_UPDATED} />
}
