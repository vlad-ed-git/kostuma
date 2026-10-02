import { cn } from "@/lib/utils"

/**
 * Fog rolling along the bottom of its (positioned) parent: the home title
 * and the 404 (spec §8.7). Two layers at different speeds; still under
 * reduced motion. It fades out before its parent's edges.
 */
export function Fog({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("fog", className)}>
      <span />
      <span />
    </div>
  )
}
