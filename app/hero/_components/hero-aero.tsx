import Image from "next/image"
import Link from "next/link"
import { DropletIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import background from "@/assets/hero-background-3.png"

import { heroCopy } from "./hero-copy"
import { navLinks } from "./nav-links"
import { WaitlistForm } from "./waitlist-form"

const glass =
  "border border-white/50 bg-white/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_8px_32px_-8px_rgb(12_74_110/0.35)] backdrop-blur-xl backdrop-saturate-150"

export function HeroAero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden bg-sky-500 text-white">
      <Image
        src={background}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="-z-10 object-cover object-bottom"
      />
      {/* Deepens the upper sky so white copy stays legible. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-sky-700/40 via-sky-700/20 to-transparent"
      />
      {/* Soft scrim behind the copy so white text holds up over the clouds. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-radial-[45%_40%_at_50%_45%] from-sky-800/40 via-sky-800/20 via-60% to-transparent"
      />

      <header className="px-4 pt-4">
        <div
          className={`mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-4 rounded-full py-2 pr-2 pl-3 md:grid-cols-[1fr_auto_1fr] ${glass}`}
        >
          <Link
            href="/hero/2"
            className="flex items-center gap-2 justify-self-start"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-radial-[at_30%_25%] from-white via-sky-300 to-blue-600 shadow-[inset_0_-2px_4px_rgb(12_74_110/0.4),0_2px_6px_rgb(12_74_110/0.3)]">
              <DropletIcon
                aria-hidden="true"
                className="size-4 fill-white/80 text-white"
              />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Loupe
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-full px-3.5 py-2 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Button className="justify-self-end bg-white px-4 text-sky-950 shadow-[0_2px_8px_rgb(12_74_110/0.25)] hover:bg-sky-50 active:bg-sky-100">
            Sign in
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pt-16 pb-24 text-center sm:pt-24">
        <p
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${glass}`}
        >
          <SparklesIcon aria-hidden="true" className="size-3.5" />
          {heroCopy.eyebrow}
        </p>
        <h1 className="mt-6 text-5xl leading-[1.05] font-semibold tracking-tight text-balance drop-shadow-[0_2px_16px_rgb(8_47_73/0.35)] sm:text-6xl lg:text-7xl">
          {heroCopy.heading}
        </h1>
        <p className="mt-6 max-w-xl text-base text-pretty text-white/90 drop-shadow-[0_1px_8px_rgb(8_47_73/0.4)] sm:text-lg">
          {heroCopy.description}
        </p>
        <WaitlistForm
          className="mt-10 max-w-md"
          classNames={{
            group:
              "h-14 border-white/70 bg-white/75 shadow-[inset_0_1px_0_white,0_12px_32px_-8px_rgb(12_74_110/0.45)] backdrop-blur-xl",
            icon: "text-sky-900/50",
            input: "text-sky-950 placeholder:text-sky-900/45",
            inputGroupButton: "pr-2",
            button:
              "h-11 bg-linear-to-b from-sky-400 to-blue-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.55),0_2px_8px_rgb(37_99_235/0.4)] hover:from-sky-300 hover:to-blue-500",
            error:
              "mx-auto w-fit rounded-full bg-white/85 px-3 py-1 text-red-700 backdrop-blur-md",
            success: `mx-auto w-fit rounded-full px-4 py-2 font-medium ${glass}`,
          }}
        />
      </div>
    </section>
  )
}
