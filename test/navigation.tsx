import type { ComponentProps } from "react"
import { vi } from "vitest"

/**
 * Stands in for `@/i18n/navigation` in component tests, which run without
 * Next.js' router: `vi.mock("@/i18n/navigation", () => import(
 * "@/test/navigation"))`. Links become plain anchors, prefixed like
 * next-intl's (`as-needed`: English at the root, others under `/es`…).
 */
export function Link({
  href,
  locale,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string; locale?: string }) {
  const prefix = locale && locale !== "en" ? `/${locale}` : ""
  return <a href={prefix && href === "/" ? prefix : prefix + href} {...props} />
}

export const replace = vi.fn()

export const usePathname = () => "/"

export const useRouter = () => ({ replace, push: vi.fn() })
