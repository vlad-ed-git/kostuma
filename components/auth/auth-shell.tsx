import { getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { Fog } from "@/components/horror/fog"

type AuthShellProps = {
  title: string
  /** One line under the title. */
  lead?: string
  children: ReactNode
  /** The way to the other account page, under the form. */
  footer?: ReactNode
}

/**
 * The account pages' frame (spec §11.5): on desktop, the night on the left
 * (fog, and "Are you ready for the dark?" in outlined gothic letters lit
 * red from below); the form on the right, at most 400 px wide. Phones: the form.
 */
export async function AuthShell({
  title,
  lead,
  children,
  footer,
}: AuthShellProps) {
  const t = await getTranslations("Auth")

  return (
    <div className="mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-16 lg:px-8">
      <div
        aria-hidden="true"
        className="relative isolate hidden items-center lg:col-span-5 lg:flex"
      >
        <div className="auth-night absolute inset-0 -z-10" />
        {/* Faded out on every side: no edge shows where the fog stops. */}
        <div className="auth-fog absolute inset-0 -z-10">
          <Fog />
        </div>
        <p className="auth-line font-heading text-display font-semibold text-balance">
          {t("panel")}
        </p>
      </div>
      <div className="flex py-12 lg:col-span-7 lg:items-center lg:py-20">
        <div className="mx-auto flex w-full max-w-100 flex-col gap-8">
          <header className="flex flex-col gap-3">
            <h1 className="font-heading text-display font-semibold text-balance">
              {title}
            </h1>
            {lead && <p className="text-lead text-muted-foreground">{lead}</p>}
          </header>
          {children}
          {footer && <p className="text-lg text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  )
}

/** The footer's link to the other account page. */
export const authLinkClass =
  "text-foreground underline underline-offset-4 decoration-blood transition-colors hover:text-blood-text"
