import Image from "next/image"
import Link from "next/link"
import { Cormorant_Garamond } from "next/font/google"
import { WavesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import background from "@/assets/hero-background-1.png"

import { heroCopy } from "./hero-copy"
import { navLinks } from "./nav-links"
import { WaitlistForm } from "./waitlist-form"

const engraving = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-engraving",
})

export function HeroVintage() {
  return (
    <section
      className={cn(
        engraving.variable,
        "relative isolate flex min-h-svh flex-col overflow-hidden bg-(--paper) text-azure-950 [--paper:#f8f3e6]"
      )}
    >
      <Image
        src={background}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="-z-10 object-cover object-bottom"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-3/5 bg-linear-to-b from-(--paper) via-(--paper)/85 to-transparent"
      />

      <header className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-6 px-6 py-5 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/hero/1"
          className="flex items-center gap-2.5 justify-self-start"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-azure-900/40">
            <WavesIcon aria-hidden="true" className="size-4 text-azure-900" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Loupe</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-azure-900/80 underline-offset-8 transition-colors hover:text-azure-950 hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Button
          variant="outline"
          className="justify-self-end border-azure-900/35 bg-transparent px-4 text-azure-950 hover:bg-azure-950/5 active:bg-azure-950/10"
        >
          Sign in
        </Button>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pt-12 pb-24 text-center sm:pt-20">
        <p className="text-xs font-medium tracking-[0.2em] text-azure-800 uppercase">
          {heroCopy.eyebrow}
        </p>
        <h1 className="mt-8 font-(family-name:--font-engraving) text-5xl leading-[1.02] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {heroCopy.heading}
        </h1>
        <p className="mt-8 max-w-xl text-base text-pretty text-azure-950/75 sm:text-lg">
          {heroCopy.description}
        </p>
        <WaitlistForm
          className="mt-9 max-w-md"
          classNames={{
            group:
              "border-azure-900/25 bg-(--paper)/90 shadow-[0_1px_0_rgb(255_255_255/0.8)_inset,0_6px_24px_-8px_rgb(30_58_138/0.35)] backdrop-blur-sm",
            icon: "text-azure-900/60",
            input: "text-azure-950 placeholder:text-azure-900/45",
            inputGroupButton: "pr-1",
            button: "text-(--paper) ",
            error: "text-red-800",
            success: "text-azure-900",
          }}
        />
      </div>
    </section>
  )
}
