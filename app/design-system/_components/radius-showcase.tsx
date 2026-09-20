import { Subsection } from "./section"

const radii = [
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
  "rounded-full",
]

export function RadiusShowcase() {
  return (
    <Subsection className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {radii.map((radius) => (
        <div key={radius} className="flex flex-col gap-3">
          <div
            className={`aspect-[4/3] border-2 border-brand-background bg-brand-subtle ${radius}`}
          />
          <code className="font-mono text-xs font-medium">{radius}</code>
        </div>
      ))}
    </Subsection>
  )
}
