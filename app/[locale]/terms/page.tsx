import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalPage } from "@/components/legal/legal-page"
import { TERMS_UPDATED } from "@/lib/legal"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms")
  return { title: t("title") }
}

/** The Terms of service (spec §11.9). */
export default function TermsPage() {
  return <LegalPage document="Terms" updated={TERMS_UPDATED} />
}
