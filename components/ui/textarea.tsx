import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-none border border-transparent border-b-input bg-transparent px-0 py-3 text-xl transition-[color,border-color,box-shadow] outline-none placeholder:text-muted-foreground hover:border-b-foreground/70 focus-visible:border-b-ring focus-visible:shadow-[inset_0_-1px_0_var(--ring)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-b-destructive aria-invalid:focus-visible:shadow-[inset_0_-1px_0_var(--destructive)] md:text-lg",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
