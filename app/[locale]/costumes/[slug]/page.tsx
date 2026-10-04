import { RiArrowLeftLine, RiArrowRightLine, RiFilmLine } from "@remixicon/react"
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { AddToBasket } from "@/components/basket/add-to-basket"
import { BillingBlock } from "@/components/costume/billing-block"
import { CostumeGallery } from "@/components/costume/costume-gallery"
import { CostumeRow } from "@/components/costume/costume-row"
import { filmLine } from "@/components/costume/format"
import { WardrobeList } from "@/components/costume/wardrobe-list"
import { costumesHref } from "@/components/layout/nav"
import { JsonLd } from "@/components/seo/json-ld"
import { Link } from "@/i18n/navigation"
import { getCostume, getNeighbors, getRelated, toSummary } from "@/lib/catalog"
import type { Costume } from "@/lib/catalog/types"
import { breadcrumbs, firstSentence, jsonLd, seoFor, urlIn } from "@/lib/seo"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/costumes/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const costume = getCostume(slug, locale)
  if (!costume) return {}
  const t = await getTranslations("Costume")
  // What a search result says (todo COPY-13): the costume and its makeup
  // guide, a line of its lore, and that it is seen on one's own face.
  const title = t("metaTitle", { name: costume.name })
  const description = t("metaDescription", {
    lore: firstSentence(costume.lore),
  })
  return {
    title,
    description,
    // The card itself: opengraph-image.tsx beside this page.
    ...seoFor(locale, {
      path: `/costumes/${costume.slug}`,
      title,
      description,
    }),
  }
}

/** A costume's page, laid out like a one-sheet poster (spec §11.3). */
export default async function CostumePage({
  params,
}: PageProps<"/[locale]/costumes/[slug]">) {
  const { slug } = await params
  const locale = await getLocale()
  const costume = getCostume(slug, locale)
  if (!costume) notFound()

  const t = await getTranslations("Costume")

  return (
    <article className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      {/* The breadcrumb below, for search engines. */}
      <JsonLd
        data={jsonLd(
          breadcrumbs([
            { name: t("costumes"), url: `${urlIn("/", locale)}#costumes` },
            { name: costume.name },
          ])
        )}
      />
      <nav
        aria-label={t("breadcrumb")}
        className="text-label caps text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href={costumesHref}
              className="inline-flex min-h-11 items-center transition-colors hover:text-foreground"
            >
              {t("costumes")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {costume.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
          <CostumeGallery name={costume.name} photos={costume.images} />
        </div>

        <div className="flex flex-col gap-12 lg:col-span-7">
          <header className="flex flex-col gap-5">
            <h1 className="font-heading text-display font-semibold text-balance">
              {costume.name}
            </h1>
            <p className="flex items-start gap-3 text-lead text-muted-foreground italic">
              <RiFilmLine
                aria-hidden="true"
                className="mt-[0.3em] size-5 shrink-0"
              />
              {filmLine(costume.films, (film) => t("film", film))}
            </p>
            <AddToBasket slug={costume.slug} name={costume.name} />
          </header>

          <Section title={t("lore")}>
            <p className="max-w-[65ch] text-body-lg">{costume.lore}</p>
          </Section>
          <Section title={t("look")}>
            <WardrobeList look={costume.look} />
          </Section>
          <Section title={t("funFact")}>
            <p className="max-w-[65ch] border-s-2 border-blood ps-5">
              {costume.funFact}
            </p>
          </Section>
          <Section title={t("credits")}>
            <BillingBlock costume={costume} />
          </Section>
        </div>
      </div>

      <Neighbors costume={costume} />
      <Related costume={costume} />
    </article>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-label caps text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

/** The costumes just before and after this one in the collection. */
async function Neighbors({ costume }: { costume: Costume }) {
  const t = await getTranslations("Costume")
  const { previous, next } = getNeighbors(costume, await getLocale())

  return (
    <nav
      aria-label={t("neighbors")}
      className="mt-20 grid gap-8 border-t border-border pt-8 sm:grid-cols-2"
    >
      {previous && (
        <Link
          href={`/costumes/${previous.slug}`}
          className="group flex flex-col items-start gap-2"
        >
          <span className="inline-flex items-center gap-2 text-micro caps text-muted-foreground">
            <RiArrowLeftLine aria-hidden="true" className="size-4" />
            {t("previous")}
          </span>
          <span className="font-heading text-h3 font-medium transition-colors group-hover:text-blood-text">
            {previous.name}
          </span>
        </Link>
      )}
      {next && (
        <Link
          href={`/costumes/${next.slug}`}
          className="group flex flex-col items-start gap-2 sm:col-start-2 sm:items-end sm:text-end"
        >
          <span className="inline-flex items-center gap-2 text-micro caps text-muted-foreground">
            {t("next")}
            <RiArrowRightLine aria-hidden="true" className="size-4" />
          </span>
          <span className="font-heading text-h3 font-medium transition-colors group-hover:text-blood-text">
            {next.name}
          </span>
        </Link>
      )}
    </nav>
  )
}

/** Others from the same film, else the next costumes. */
async function Related({ costume }: { costume: Costume }) {
  const t = await getTranslations("Costume")
  const related = getRelated(costume, 4, await getLocale())

  return (
    <section aria-labelledby="related" className="mt-20">
      <h2 id="related" className="font-heading text-h2 font-semibold">
        {related.kind === "film"
          ? t("moreFrom", { film: related.film.title })
          : t("moreWanted")}
      </h2>
      <ul className="mt-6 grid gap-x-16 gap-y-2 lg:grid-cols-2">
        {related.costumes.map((other) => (
          <li key={other.slug}>
            <CostumeRow costume={toSummary(other)} />
          </li>
        ))}
      </ul>
    </section>
  )
}
