"use client"

import * as React from "react"

import { Subsection } from "./section"

type TokenPair = {
  background: string
  foreground?: string
}

const paletteSteps = [
  "50",
  "100",
  "150",
  "200",
  "250",
  "300",
  "350",
  "400",
  "450",
  "500",
  "550",
  "600",
  "650",
  "700",
  "750",
  "800",
  "850",
  "900",
  "950",
]

/* Drop 950 from the shared ladder so the dark surface steps stay in order */
const graphiteSteps = [
  "25",
  ...paletteSteps.slice(0, -1),
  "925",
  "950",
  "975",
  "985",
]

const interactiveGroup = (
  title: string,
  base: string,
  description: string,
  foreground = `${base}-foreground`
) => ({
  title,
  description,
  columns: "grid-cols-2 lg:grid-cols-3",
  pairs: [
    { background: `${base}-background`, foreground },
    { background: `${base}-hover`, foreground },
    { background: `${base}-active`, foreground },
  ],
})

const colorGroups: {
  title: string
  description: string
  columns: string
  pairs: TokenPair[]
}[] = [
  {
    title: "Surfaces",
    description:
      "Page, card, dialog and popover layers with their foreground pairs, plus the translucent modal overlay. Dialog covers Dialog, AlertDialog, Drawer, Sheet and Toast. Popover covers Popover, DropdownMenu, Select and Command. Popover-subtle is the recessed layer inside a popover: fields and the highlighted item. Frosted surfaces use opacity modifiers like bg-popover-background/70 instead of dedicated tokens.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "background", foreground: "foreground" },
      { background: "card-background", foreground: "card-foreground" },
      { background: "dialog-background", foreground: "dialog-foreground" },
      { background: "popover-background", foreground: "popover-foreground" },
      { background: "popover-subtle" },
      { background: "overlay" },
    ],
  },
  {
    title: "Identity",
    description:
      "Static colors with no hover or active state. Brand is azure-600, the #006aff brand color itself; neutral covers quiet surfaces and secondary text.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "brand-background", foreground: "brand-foreground" },
      { background: "neutral-background", foreground: "neutral-foreground" },
    ],
  },
  interactiveGroup(
    "Brand action",
    "action-brand",
    "Primary buttons, links and checked controls. Hover and active keep action-brand-foreground readable."
  ),
  interactiveGroup(
    "Neutral action",
    "action-neutral",
    "Outline and ghost button states plus toggle, menu, select and table highlights. Text stays foreground.",
    "foreground"
  ),
  interactiveGroup(
    "Destructive action",
    "action-destructive",
    "Soft red for destructive buttons and menu items. For error states use danger."
  ),
  {
    title: "Status",
    description:
      "Success, info, danger and warning. Warning is fill-only in light mode. For a status border use the matching line token, not the fill.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "success-background", foreground: "success-foreground" },
      { background: "info-background", foreground: "info-foreground" },
      { background: "danger-background", foreground: "danger-foreground" },
      { background: "warning-background", foreground: "warning-foreground" },
    ],
  },
  {
    title: "Lines",
    description:
      "Borders, focus rings and invalid rings. A status line carries the fill color so it reads at full strength on an invalid control, and takes an opacity modifier where a softer edge is wanted, like border-danger-line/30 on a toast.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "border" },
      { background: "ring" },
      { background: "halo" },
      { background: "danger-halo" },
      { background: "success-line" },
      { background: "info-line" },
      { background: "danger-line" },
      { background: "warning-line" },
    ],
  },
  {
    title: "Controls",
    description:
      "Field fill for inputs, textareas, selects, picker triggers, checkboxes and radios; slider and switch thumb; active tab pill. Calendar today and selected day follow neutral and action-brand, so a recolor of either carries through.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "field", foreground: "foreground" },
      { background: "thumb" },
      { background: "tabs", foreground: "foreground" },
      {
        background: "calendar-today-background",
        foreground: "calendar-today-foreground",
      },
      {
        background: "calendar-selected-day-background",
        foreground: "calendar-selected-day-foreground",
      },
    ],
  },
  {
    title: "Tints",
    description:
      "Solid low-emphasis fills for badges, avatars and selected states. Pair each with its base color as text. Brand is the exception: brand on brand-subtle is 4.29:1, so small text uses action-brand instead.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "brand-subtle", foreground: "action-brand-background" },
      { background: "action-brand-subtle", foreground: "action-brand-background" },
      { background: "neutral-subtle", foreground: "neutral-foreground" },
      { background: "success-subtle", foreground: "success-background" },
      { background: "info-subtle", foreground: "info-background" },
      { background: "danger-subtle", foreground: "danger-background" },
      { background: "warning-subtle", foreground: "foreground" },
    ],
  },
  {
    title: "Chart",
    description: "Sequential azure scale used by every chart.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "chart-1" },
      { background: "chart-2" },
      { background: "chart-3" },
      { background: "chart-4" },
      { background: "chart-5" },
    ],
  },
  {
    title: "Sidebar",
    description: "Sidebar tokens now point at brand and neutral.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: [
      { background: "sidebar-background", foreground: "sidebar-foreground" },
      {
        background: "sidebar-accent-background",
        foreground: "sidebar-accent-foreground",
      },
      { background: "sidebar-border" },
      { background: "sidebar-ring" },
    ],
  },
  {
    title: "Azure palette",
    description:
      "Primitive scale behind brand and action, on the shared ladder in steps of 50. Hue and chroma come from the #006aff brand color. Step 600 is pinned to that exact hex at lightness 0.571; every other step holds its lightness parity with graphite.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: paletteSteps.map((step) => ({ background: `color-azure-${step}` })),
  },
  {
    title: "Graphite palette",
    description:
      "Achromatic scale on the shared lightness ladder. Half steps sit at the exact lightness midpoint of their neighbours. Steps 25, 925, 975 and 985 are surface steps for VS Code–style charcoal dark mode.",
    columns: "grid-cols-2 lg:grid-cols-3",
    pairs: graphiteSteps.map((step) => ({
      background: `color-graphite-${step}`,
    })),
  },
]

function subscribeToRoot(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style"],
  })
  return () => observer.disconnect()
}

type ThemeDeclarations = {
  light: Map<string, string>
  dark: Map<string, string>
}

let declarationCache: {
  sheetCount: number
  declarations: ThemeDeclarations
} | null = null

function collectRules(rules: CSSRuleList, declarations: ThemeDeclarations) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const selectors = rule.selectorText
        .split(",")
        .map((selector) => selector.trim())
      const target = selectors.includes(".dark")
        ? declarations.dark
        : selectors.includes(":root")
          ? declarations.light
          : null
      if (!target) {
        continue
      }
      for (const property of Array.from(rule.style)) {
        if (property.startsWith("--")) {
          target.set(property, rule.style.getPropertyValue(property).trim())
        }
      }
    } else if ("cssRules" in rule) {
      collectRules((rule as CSSGroupingRule).cssRules, declarations)
    }
  }
}

function getThemeDeclarations() {
  const sheets = Array.from(document.styleSheets)
  if (declarationCache?.sheetCount === sheets.length) {
    return declarationCache.declarations
  }

  const declarations: ThemeDeclarations = { light: new Map(), dark: new Map() }
  for (const sheet of sheets) {
    try {
      collectRules(sheet.cssRules, declarations)
    } catch {
      continue
    }
  }
  declarationCache = { sheetCount: sheets.length, declarations }
  return declarations
}

function referencedToken(value: string) {
  return value.match(/^var\((--[\w-]+)\)$/)?.[1] ?? ""
}

function useTokenSource(name: string) {
  return React.useSyncExternalStore(
    subscribeToRoot,
    () => {
      const { light, dark } = getThemeDeclarations()
      const isDark = document.documentElement.classList.contains("dark")
      const value =
        (isDark ? dark.get(`--${name}`) : undefined) ?? light.get(`--${name}`)
      return value ? referencedToken(value) : ""
    },
    () => ""
  )
}

function TokenValue({ name }: { name: string }) {
  const value = useTokenSource(name)

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <code className="truncate font-mono text-xs font-medium">--{name}</code>
      {value ? (
        <span className="truncate font-mono text-xs text-neutral-foreground">
          {value}
        </span>
      ) : null}
    </div>
  )
}

function TokenCard({ background, foreground }: TokenPair) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl bg-card-background ring-1 ring-border">
      <div
        className="flex h-24 items-end p-4"
        style={{
          backgroundColor: `var(--${background})`,
          color: foreground ? `var(--${foreground})` : undefined,
        }}
      >
        {foreground ? (
          <span className="font-heading text-2xl font-medium">Aa</span>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 border-t p-4">
        <TokenValue name={background} />
        {foreground ? <TokenValue name={foreground} /> : null}
      </div>
    </div>
  )
}

export function ColorTokens() {
  return colorGroups.map((group) => (
    <Subsection
      key={group.title}
      title={group.title}
      className={`grid gap-4 ${group.columns}`}
    >
      {group.pairs.map((pair) => (
        <TokenCard
          key={`${pair.background}-${pair.foreground ?? ""}`}
          {...pair}
        />
      ))}
    </Subsection>
  ))
}
