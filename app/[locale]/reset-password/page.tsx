import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { authLinkClass, AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Link } from "@/i18n/navigation"
import { safeNext, withNext } from "@/lib/auth/next-path"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth")
  return { title: t("resetTitle"), robots: { index: false } }
}

/** Reset password (spec §11.5). */
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/[locale]/reset-password">) {
  const next = safeNext((await searchParams).next)
  const t = await getTranslations("Auth")

  return (
    <AuthShell
      title={t("resetTitle")}
      lead={t("resetLead")}
      footer={
        <Link href={withNext("/sign-in", next)} className={authLinkClass}>
          {t("backToSignIn")}
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
