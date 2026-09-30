import type { ComponentProps } from "react"
import { vi } from "vitest"

type Href = string | { pathname: string; hash?: string }

/**
 * Stands in for `@/i18n/navigation` in component tests, which run without
 * Next.js' router: `vi.mock("@/i18n/navigation", () => import(
 * "@/test/navigation"))`. Links become plain anchors, prefixed like
 * next-intl's (`as-needed`: English at the root, others under `/es`…), and
 * take the same string or `{ pathname, hash }` hrefs.
 */
export function Link({
  href,
  locale,
  ...props
}: Omit<ComponentProps<"a">, "href"> & {
  href: Href
  locale?: string
  prefetch?: boolean | "auto" | null
}) {
  // Next.js' own prop: no meaning on a plain anchor.
  delete props.prefetch
  const { pathname, hash } =
    typeof href === "string" ? { pathname: href } : href
  const prefix = locale && locale !== "en" ? `/${locale}` : ""
  const path = prefix && pathname === "/" ? prefix : prefix + pathname
  return <a href={hash ? `${path}#${hash}` : path} {...props} />
}

export const replace = vi.fn()

export const usePathname = () => "/"

export const useRouter = () => ({ replace, push: vi.fn() })
