import { useTranslations } from "next-intl"

import { Fog } from "@/components/horror/fog"

// The home page's title card, until feat/landing adds the countdown, the
// costumes and the rest (spec §11.1).
export default function HomePage() {
  const t = useTranslations("App")

  return (
    <section
      data-title-card
      // Slides under the header, which stays transparent over a title card.
      className="relative isolate -mt-16 flex max-h-240 min-h-svh items-end overflow-hidden px-4 pt-32 pb-24 sm:px-6 lg:px-8"
    >
      <Fog />
      <div className="film-weave mx-auto w-full max-w-7xl">
        <h1 className="max-w-[12ch] font-heading text-display-xl uppercase">
          {t("taglineLead")}
        </h1>
        <p className="mt-6 font-heading text-h2 text-blood-text uppercase">
          {t("taglineTail")}
        </p>
      </div>
    </section>
  )
}
