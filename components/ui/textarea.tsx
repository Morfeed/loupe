import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent bg-field px-3 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-neutral-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-halo disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-line aria-invalid:ring-3 aria-invalid:ring-danger-halo md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
