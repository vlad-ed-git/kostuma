import type { Metadata } from "next"
import { getFormatter, getLocale, getTranslations } from "next-intl/server"

import { FittingRoomPanel } from "@/components/basket/fitting-room-panel"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { redirect } from "@/i18n/navigation"
import { withNext } from "@/lib/auth/next-path"
import { getUser } from "@/lib/auth/session"
import { allowanceFor } from "@/lib/fitting-room/service"
import { getProfile } from "@/lib/users"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account")
  return { title: t("title"), robots: { index: false } }
}

/**
 * Your account (spec §11.6): who you are, whether your free costume is
 * still waiting in the Fitting Room, Kostuma Pro, and Sign out. Signed out:
 * sign in first, then back here.
 */
export default async function AccountPage() {
  const user = await getUser()
  if (!user) {
    return redirect({
      href: withNext("/sign-in", "/account"),
      locale: await getLocale(),
    })
  }
  const [profile, allowance] = await Promise.all([
    getProfile(user.uid).catch((error: unknown) => {
      console.error("Could not read a profile.", error)
      return null
    }),
    allowanceFor(user.uid),
  ])
  const t = await getTranslations("Account")
  const format = await getFormatter()

  const details: [string, string][] = [
    [t("name"), profile?.name || user.name],
    [t("email"), user.email || profile?.email || ""],
  ]
  if (profile?.createdAt) {
    details.push([
      t("memberSince"),
      format.dateTime(profile.createdAt, { dateStyle: "long" }),
    ])
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <div className="flex max-w-4xl flex-col gap-10">
        <h1 className="font-heading text-display font-semibold">
          {t("title")}
        </h1>
        <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          {details
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-label caps text-muted-foreground sm:pt-1">
                  {label}
                </dt>
                <dd className="text-lead break-words">{value}</dd>
              </div>
            ))}
        </dl>
        <FittingRoomPanel signedIn free={allowance?.free} source="account" />
        <SignOutButton />
      </div>
    </div>
  )
}
