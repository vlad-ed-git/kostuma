import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AuthShell } from "@/components/auth/auth-shell"
import { Feedback } from "@/components/feedback/feedback"
import { kindOf } from "@/lib/feedback/schema"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Feedback")
  return { title: t("metaTitle") }
}

/**
 * Report a bug · Share feedback · Request a costume (spec §11.7): one form,
 * open to everyone, on the kind the link asked for (`?type=`).
 */
export default async function FeedbackPage({
  searchParams,
}: PageProps<"/[locale]/feedback">) {
  const kind = kindOf((await searchParams).type)
  const siteKey = process.env.RECAPTCHA_SITE_KEY
  // For developers (the error page tells the visitor in their language).
  if (!siteKey) throw new Error("RECAPTCHA_SITE_KEY is not set.")
  const t = await getTranslations("Feedback")

  return (
    <AuthShell title={t("title")} lead={t("lead")} panel={t("panel")} wide>
      {/* Another footer link (another kind): a new form on that kind. */}
      <Feedback key={kind} kind={kind} recaptchaSiteKey={siteKey} />
    </AuthShell>
  )
}
