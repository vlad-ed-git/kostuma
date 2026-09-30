import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Kostuma's badges (docs/design-spec.md §10.1) add a hairline border and a
// little padding to the preset's text badge, so they read as stamped labels.
const stamp = "border px-1.5 py-0.5"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-none border-0 bg-transparent px-0 py-0 text-[0.625rem] font-semibold tracking-widest whitespace-nowrap uppercase transition-colors has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "text-foreground [a]:hover:text-foreground/70",
        secondary: "text-muted-foreground [a]:hover:text-foreground",
        destructive: "text-destructive [a]:hover:text-destructive/70",
        outline: "text-foreground [a]:hover:text-foreground/70",
        ghost: "text-muted-foreground hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        /** A feature that isn't open yet. */
        soon: cn(stamp, "border-foreground/20 text-muted-foreground"),
        /** A paid capability: an admission ticket. */
        premium: cn(
          stamp,
          "border-blood-text/50 text-foreground [&>svg]:text-blood-text"
        ),
        /** A 2024–2026 breakout character. */
        newBlood: cn(stamp, "border-blood-text/40 text-blood-text"),
        /** How many costumes the Pumpkin Basket holds. */
        count: "min-w-5 bg-ember px-1.5 py-0.5 text-background tabular-nums",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
