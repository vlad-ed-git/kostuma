import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { authLinkClass, AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"
import { Link, redirect } from "@/i18n/navigation"
import { safeNext, withNext } from "@/lib/auth/next-path"
import { getUser } from "@/lib/auth/session"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth")
  return { title: t("registerTitle"), robots: { index: false } }
}

/** Register (spec §11.5). Signed in already: on to where they were going. */
export default async function RegisterPage({
  searchParams,
}: PageProps<"/[locale]/register">) {
  const next = safeNext((await searchParams).next)
  if (await getUser()) redirect({ href: next, locale: await getLocale() })
  const siteKey = process.env.RECAPTCHA_SITE_KEY
  // For developers (the error page tells the visitor in their language).
  if (!siteKey) throw new Error("RECAPTCHA_SITE_KEY is not set.")
  const t = await getTranslations("Auth")

  return (
    <AuthShell
      title={t("registerTitle")}
      footer={t.rich("haveAccount", {
        link: (chunks) => (
          <Link href={withNext("/sign-in", next)} className={authLinkClass}>
            {chunks}
          </Link>
        ),
      })}
    >
      <RegisterForm next={next} recaptchaSiteKey={siteKey} />
    </AuthShell>
  )
}
