import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { authLinkClass, AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Link, redirect } from "@/i18n/navigation"
import { safeNext, withNext } from "@/lib/auth/next-path"
import { getUser } from "@/lib/auth/session"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth")
  return { title: t("signInTitle"), robots: { index: false } }
}

/** Sign in (spec §11.5). Signed in already: on to where they were going. */
export default async function SignInPage({
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const next = safeNext((await searchParams).next)
  if (await getUser()) redirect({ href: next, locale: await getLocale() })
  const t = await getTranslations("Auth")

  return (
    <AuthShell
      title={t("signInTitle")}
      footer={t.rich("newHere", {
        link: (chunks) => (
          <Link href={withNext("/register", next)} className={authLinkClass}>
            {chunks}
          </Link>
        ),
      })}
    >
      <SignInForm next={next} />
    </AuthShell>
  )
}
