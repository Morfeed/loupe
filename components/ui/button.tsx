import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-halo disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger-line aria-invalid:ring-3 aria-invalid:ring-danger-halo [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-action-brand-background text-action-brand-foreground hover:bg-action-brand-hover active:bg-action-brand-active aria-expanded:bg-action-brand-active aria-pressed:bg-action-brand-active",
        outline:
          "border-border bg-background text-foreground hover:bg-action-neutral-hover active:bg-action-neutral-active aria-expanded:bg-action-neutral-active aria-pressed:bg-action-neutral-active",
        field:
          "rounded-3xl bg-field font-normal text-foreground data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-halo",
        ghost:
          "text-foreground hover:bg-action-neutral-hover active:bg-action-neutral-active aria-expanded:bg-action-neutral-active aria-pressed:bg-action-neutral-active",
        destructive:
          "bg-action-destructive-background text-action-destructive-foreground hover:bg-action-destructive-hover active:bg-action-destructive-active aria-expanded:bg-action-destructive-active aria-pressed:bg-action-destructive-active",
        link: "text-action-brand-background underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
