import { RiArrowRightUpLine } from "@remixicon/react"
import { getFormatter, getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { breaks } from "@/components/ui/breaks"
import { Link } from "@/i18n/navigation"
import { SUPPORT_EMAIL } from "@/lib/legal"
import en from "@/messages/en.json"

export type LegalDocument = "Terms" | "Privacy"

type Block =
  | { kind: "paragraph"; key: string }
  | { kind: "list"; key: string; items: string[] }

/**
 * A document's sections and their blocks, in order, read from the English
 * messages: every language has the same keys (i18n/messages.test.ts). In a
 * section, `title` is its heading, a `p…` key a paragraph and a `list…` key
 * a list (one message per item).
 */
export function sectionsOf(document: LegalDocument) {
  return Object.entries(en[document].sections).map(([id, section]) => ({
    id,
    blocks: Object.entries(section as Record<string, unknown>).flatMap(
      ([key, value]): Block[] => {
        if (key.startsWith("p") && typeof value === "string") {
          return [{ kind: "paragraph", key }]
        }
        if (key.startsWith("list") && typeof value === "object" && value) {
          return [{ kind: "list", key, items: Object.keys(value) }]
        }
        return []
      }
    ),
  }))
}

const link =
  "text-foreground underline decoration-blood underline-offset-4 transition-colors hover:text-blood-text"

/** The tags and arguments any legal message may use. */
function richValues(newTab: string) {
  const external = (href: string) =>
    function ExternalLink(chunks: ReactNode) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          {chunks}
          <RiArrowRightUpLine
            aria-hidden="true"
            className="ms-0.5 inline size-[0.9em] align-[-0.1em]"
          />
          <span className="sr-only"> {newTab}</span>
        </a>
      )
    }
  return {
    ...breaks,
    address: SUPPORT_EMAIL,
    b: (chunks: ReactNode) => (
      <strong className="font-semibold">{chunks}</strong>
    ),
    email: (chunks: ReactNode) => (
      <a href={`mailto:${SUPPORT_EMAIL}`} className={link}>
        {chunks}
      </a>
    ),
    terms: (chunks: ReactNode) => (
      <Link href="/terms" className={link}>
        {chunks}
      </Link>
    ),
    privacy: (chunks: ReactNode) => (
      <Link href="/privacy" className={link}>
        {chunks}
      </Link>
    ),
    feedback: (chunks: ReactNode) => (
      <Link href="/feedback" className={link}>
        {chunks}
      </Link>
    ),
    google: external("https://policies.google.com/privacy"),
    googleTerms: external("https://policies.google.com/terms"),
    vercel: external("https://vercel.com/legal/privacy-policy"),
  }
}

/**
 * The Terms of service and the Privacy policy (spec §11.9): the title card
 * (the ghost title and the tape rolling through it), when it last changed,
 * then the sections, with their contents beside them from `lg`.
 */
export async function LegalPage({
  document,
  updated,
}: {
  document: LegalDocument
  /** YYYY-MM-DD (lib/legal.ts). */
  updated: string
}) {
  const t = await getTranslations(document)
  const legal = await getTranslations("Legal")
  const format = await getFormatter()
  // The keys are built from the document's own structure (sectionsOf), so
  // they exist; next-intl's types only know keys written out.
  const text = (key: string) =>
    (t.rich as unknown as (key: string, values: object) => ReactNode)(
      key,
      richValues(legal("newTab"))
    )
  const sections = sectionsOf(document)

  return (
    <div className="relative isolate overflow-x-clip">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pt-14">
        <header className="relative max-w-4xl">
          <h1 className="vhs-ghost-title font-heading text-display font-semibold text-balance">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-[60ch] text-lead text-muted-foreground">
            {t("lead")}
          </p>
          <p className="mt-6 text-micro caps text-muted-foreground">
            {legal("updated", {
              date: format.dateTime(new Date(updated), {
                dateStyle: "long",
                timeZone: "UTC",
              }),
            })}
          </p>
          <div
            aria-hidden="true"
            className="vhs-tracking vhs-tracking-fade title-tape"
          />
        </header>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <nav
            aria-label={legal("contents")}
            className="hidden lg:col-span-3 lg:block"
          >
            <ol className="sticky top-24 flex flex-col">
              {sections.map(({ id }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="block py-1.5 text-base text-muted-foreground transition-colors hover:text-blood-text"
                  >
                    {text(`sections.${id}.title`)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex max-w-[68ch] flex-col gap-14 lg:col-span-8 lg:col-start-5">
            {sections.map(({ id, blocks }) => (
              <section
                key={id}
                id={id}
                aria-labelledby={`${id}-title`}
                className="scroll-mt-24"
              >
                <h2
                  id={`${id}-title`}
                  className="font-heading text-h4 font-semibold text-balance"
                >
                  {text(`sections.${id}.title`)}
                </h2>
                <div className="mt-5 flex flex-col gap-5 text-body-lg">
                  {blocks.map((block) =>
                    block.kind === "paragraph" ? (
                      <p key={block.key}>
                        {text(`sections.${id}.${block.key}`)}
                      </p>
                    ) : (
                      <ul key={block.key} className="flex flex-col gap-3">
                        {block.items.map((item) => (
                          <li key={item} className="flex items-baseline gap-3">
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 translate-y-[-0.2em] border border-blood"
                            />
                            <span>
                              {text(`sections.${id}.${block.key}.${item}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
