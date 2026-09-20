"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  CpuIcon,
  DownloadIcon,
  EyeOffIcon,
  FilterIcon,
  KeyRoundIcon,
  ScanSearchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Preview, Subsection } from "./section"

const platforms = [
  { value: "x", label: "X" },
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
]

function CommandItems() {
  return (
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Actions">
        <CommandItem>
          <FilterIcon />
          New filter rule
        </CommandItem>
        <CommandItem>
          <ScanSearchIcon />
          Rescan current feed
        </CommandItem>
        <CommandItem disabled>
          <DownloadIcon />
          Export collected data
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem>
          <KeyRoundIcon />
          API keys
          <CommandShortcut>⌘K</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <CpuIcon />
          Local model
          <CommandShortcut>⌘L</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <EyeOffIcon />
          Muted authors
          <CommandShortcut>⌘M</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  )
}

function CommandCombobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const selected = platforms.find((platform) => platform.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="field" className="w-56 justify-between" />}
      >
        {selected ? selected.label : "Select a platform…"}
        <ChevronDownIcon
          data-icon="inline-end"
          className="text-neutral-foreground"
        />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search platforms…" />
          <CommandList>
            <CommandEmpty>No platform found.</CommandEmpty>
            <CommandGroup heading="Supported platforms">
              {platforms.map((platform) => (
                <CommandItem
                  key={platform.value}
                  value={platform.value}
                  data-checked={value === platform.value}
                  onSelect={(current) => {
                    setValue(current === value ? "" : current)
                    setOpen(false)
                  }}
                >
                  {platform.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function CommandShowcase() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <Subsection className="grid gap-4 md:grid-cols-2">
      <Preview>
        <CommandCombobox />
      </Preview>
      <Preview className="justify-center">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open command palette
          <kbd className="ml-1 rounded-md bg-neutral-background px-1.5 font-mono text-xs text-neutral-foreground">
            ⌘K
          </kbd>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command>
            <CommandInput placeholder="Search rules, detectors, settings…" />
            <CommandItems />
          </Command>
        </CommandDialog>
      </Preview>
    </Subsection>
  )
}
