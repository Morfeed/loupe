import { Subsection } from "./section"

const shadows = [
  { name: "Outline", className: "ring-1 ring-border" },
  { name: "Small", className: "shadow-sm ring-1 ring-border" },
  { name: "Medium", className: "shadow-md ring-1 ring-border" },
  { name: "Large", className: "shadow-lg ring-1 ring-border" },
  { name: "Extra large", className: "shadow-xl ring-1 ring-border" },
]

export function ShadowShowcase() {
  return (
    <Subsection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {shadows.map((shadow) => (
        <div
          key={shadow.name}
          className={`flex h-28 items-center justify-center rounded-3xl bg-card-background text-sm font-medium ${shadow.className}`}
        >
          {shadow.name}
        </div>
      ))}
    </Subsection>
  )
}
