import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

const link =
  "text-foreground underline decoration-blood underline-offset-4 transition-colors hover:text-blood-text"

/**
 * "I agree to the Terms of service and Privacy policy", each a link. They
 * open in a new tab, so nothing typed into the form is lost.
 */
export function TermsLabel() {
  const t = useTranslations("Auth")
  return t.rich("terms", {
    terms: (chunks) => (
      <Link href="/terms" target="_blank" prefetch={false} className={link}>
        {chunks}
      </Link>
    ),
    privacy: (chunks) => (
      <Link href="/privacy" target="_blank" prefetch={false} className={link}>
        {chunks}
      </Link>
    ),
  })
}
