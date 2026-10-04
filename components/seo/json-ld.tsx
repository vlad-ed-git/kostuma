/**
 * Structured data for search engines (lib/seo.ts), rendered on the server
 * only: a data block, never run, so the CSP's script rules don't apply to
 * it. `<` is escaped, so no text in it can close the element.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
