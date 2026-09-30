import Image from "next/image"

import placeholder from "@/public/images/costume-placeholder.webp"

type CostumeImageProps = {
  /** Which widths the image takes up, for the browser to pick a file. */
  sizes: string
  /** The page's main image: load it first (LCP). */
  eager?: boolean
  className?: string
}

/**
 * A costume's picture. Every costume shows the same placeholder until real
 * photography exists (spec §9.2); it is decorative (`alt=""`), since the
 * name is always written next to it.
 */
export function CostumeImage({ sizes, eager, className }: CostumeImageProps) {
  return (
    <Image
      src={placeholder}
      alt=""
      fill
      sizes={sizes}
      placeholder="blur"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={className}
    />
  )
}
