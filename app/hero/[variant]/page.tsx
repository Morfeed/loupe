import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { HeroAero } from "../_components/hero-aero"
import { HeroVintage } from "../_components/hero-vintage"

const heroes = {
  "1": HeroVintage,
  "2": HeroAero,
} as const

type HeroVariant = keyof typeof heroes

function isHeroVariant(value: string): value is HeroVariant {
  return Object.hasOwn(heroes, value)
}

// Only /hero/1 and /hero/2 exist; anything else 404s.
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(heroes).map((variant) => ({ variant }))
}

export const metadata: Metadata = {
  title: "Join the Loupe waitlist",
  description:
    "Filter toxicity, bots and AI slop from your social feeds with a model you control.",
}

export default async function HeroPage({
  params,
}: PageProps<"/hero/[variant]">) {
  const { variant } = await params

  if (!isHeroVariant(variant)) {
    notFound()
  }

  const Hero = heroes[variant]

  return <Hero />
}
