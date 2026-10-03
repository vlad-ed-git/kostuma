import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalPage } from "@/components/legal/legal-page"
import { PRIVACY_UPDATED } from "@/lib/legal"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy")
  return { title: t("title") }
}

/** The Privacy policy (spec §11.9): what Kostuma keeps, and why. */
export default function PrivacyPage() {
  return <LegalPage document="Privacy" updated={PRIVACY_UPDATED} />
}
