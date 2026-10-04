import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { LegalPage } from "@/components/legal/legal-page"
import { TERMS_UPDATED } from "@/lib/legal"
import { seoFor } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms")
  const app = await getTranslations("App")
  const title = t("title")
  return {
    title,
    description: t("lead"),
    ...seoFor(await getLocale(), {
      path: "/terms",
      title,
      description: t("lead"),
      homeCard: { alt: app("tagline") },
    }),
  }
}

/** The Terms of service (spec §11.9). */
export default function TermsPage() {
  return <LegalPage document="Terms" updated={TERMS_UPDATED} />
}
