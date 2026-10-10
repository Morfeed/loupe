import { Subsection } from "./section"

const sampleText = "Filter the feed, keep the conversation"

const fontFamilies = [
  {
    name: "Sans",
    utility: "font-sans",
    source: "Geist · --font-sans",
    className: "font-sans",
  },
  {
    name: "Heading",
    utility: "font-heading",
    source: "Aliases --font-sans",
    className: "font-heading",
  },
  {
    name: "Mono",
    utility: "font-mono",
    source: "Geist Mono · --font-mono",
    className: "font-mono",
  },
]

const typeScale = [
  { utility: "text-5xl", size: "48px / 1", className: "text-5xl" },
  { utility: "text-4xl", size: "36px / 40px", className: "text-4xl" },
  { utility: "text-3xl", size: "30px / 36px", className: "text-3xl" },
  { utility: "text-2xl", size: "24px / 32px", className: "text-2xl" },
  { utility: "text-xl", size: "20px / 28px", className: "text-xl" },
  { utility: "text-lg", size: "18px / 28px", className: "text-lg" },
  { utility: "text-base", size: "16px / 24px", className: "text-base" },
  { utility: "text-sm", size: "14px / 20px", className: "text-sm" },
  { utility: "text-xs", size: "12px / 16px", className: "text-xs" },
]

const fontWeights = [
  { utility: "font-normal", weight: "400", className: "font-normal" },
  { utility: "font-medium", weight: "500", className: "font-medium" },
  { utility: "font-semibold", weight: "600", className: "font-semibold" },
  { utility: "font-bold", weight: "700", className: "font-bold" },
]

const textStyles = [
  {
    name: "Display",
    source: "Page title",
    className: "font-heading text-4xl font-semibold tracking-tight",
    sample: "Your feed, filtered",
  },
  {
    name: "Section heading",
    source: "Section",
    className: "font-heading text-3xl font-semibold tracking-tight",
    sample: "Detectors",
  },
  {
    name: "Empty title",
    source: "EmptyTitle",
    className: "font-heading text-lg font-medium tracking-tight",
    sample: "No filter rules yet",
  },
  {
    name: "Dialog title",
    source: "AlertDialogTitle",
    className: "font-heading text-lg font-medium",
    sample: "Disconnect the extension?",
  },
  {
    name: "Card title",
    source: "CardTitle · DialogTitle · SheetTitle",
    className: "font-heading text-base font-medium",
    sample: "Collected posts",
  },
  {
    name: "Question title",
    source: "QuestionnaireTitle",
    className: "font-heading text-base font-semibold",
    sample: "What should Loupe filter out?",
  },
  {
    name: "Body",
    source: "Card · Dialog · Popover",
    className: "text-sm",
    sample:
      "Loupe reads posts from the page, scores them locally or with your own key, then hides what crosses your thresholds.",
  },
  {
    name: "Label",
    source: "Label · FieldTitle",
    className: "text-sm leading-none font-medium",
    sample: "Toxicity threshold",
  },
  {
    name: "Description",
    source: "CardDescription · FieldDescription",
    className: "text-sm text-neutral-foreground",
    sample: "Posts scoring above this level are hidden.",
  },
  {
    name: "Error",
    source: "FieldError",
    className: "text-sm text-danger-background",
    sample: "This API key was rejected by the provider.",
  },
  {
    name: "Caption",
    source: "MessageHeader · SidebarGroupLabel",
    className: "text-xs font-medium text-neutral-foreground",
    sample: "Loupe assistant · 9:41 AM",
  },
  {
    name: "Numeric",
    source: "ChartTooltip · ProgressValue",
    className: "font-mono font-medium tabular-nums",
    sample: "1,284 posts hidden",
  },
  {
    name: "Link",
    source: "Button variant=link",
    className:
      "text-sm font-medium text-action-brand-background underline underline-offset-4",
    sample: "Review hidden posts",
  },
]

export function TypographyScale() {
  return (
    <>
      <Subsection title="Font families" className="grid gap-4 md:grid-cols-3">
        {fontFamilies.map((font) => (
          <div
            key={font.name}
            className="flex flex-col gap-6 rounded-3xl bg-card-background p-6 ring-1 ring-border"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{font.name}</span>
              <code className="font-mono text-xs text-neutral-foreground">
                {font.utility}
              </code>
            </div>
            <div className={font.className}>
              <div className="text-5xl font-medium tracking-tight">Aa</div>
              <p className="mt-3 text-sm text-neutral-foreground">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                <br />
                abcdefghijklmnopqrstuvwxyz
                <br />
                0123456789 @#% toxicity: 0.82
              </p>
            </div>
            <span className="text-xs text-neutral-foreground">
              {font.source}
            </span>
          </div>
        ))}
      </Subsection>

      <Subsection
        title="Type scale"
        className="flex flex-col divide-y rounded-3xl border"
      >
        {typeScale.map((step) => (
          <div
            key={step.utility}
            className="grid items-baseline gap-2 px-6 py-4 sm:grid-cols-[9rem_minmax(0,1fr)]"
          >
            <div className="flex flex-col">
              <code className="font-mono text-xs font-medium">
                {step.utility}
              </code>
              <span className="font-mono text-xs text-neutral-foreground">
                {step.size}
              </span>
            </div>
            <p className={`truncate ${step.className}`}>{sampleText}</p>
          </div>
        ))}
      </Subsection>

      <Subsection
        title="Weights"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {fontWeights.map((weight) => (
          <div
            key={weight.utility}
            className="flex flex-col gap-2 rounded-3xl border p-6"
          >
            <span className={`text-3xl ${weight.className}`}>Aa</span>
            <div className="flex items-center justify-between">
              <code className="font-mono text-xs">{weight.utility}</code>
              <span className="font-mono text-xs text-neutral-foreground">
                {weight.weight}
              </span>
            </div>
          </div>
        ))}
      </Subsection>

      <Subsection
        title="Text styles"
        className="flex flex-col divide-y rounded-3xl border"
      >
        {textStyles.map((style) => (
          <div
            key={style.name}
            className="grid items-center gap-3 px-6 py-5 md:grid-cols-[16rem_minmax(0,1fr)]"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-medium">{style.name}</span>
              <span className="text-xs text-neutral-foreground">
                {style.source}
              </span>
            </div>
            <p className={style.className}>{style.sample}</p>
          </div>
        ))}
      </Subsection>
    </>
  )
}
