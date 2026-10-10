"use client"

import * as React from "react"
import {
  BotIcon,
  ChevronDownIcon,
  CpuIcon,
  KeyRoundIcon,
  LogOutIcon,
  PlugIcon,
  ScanSearchIcon,
  SettingsIcon,
  ShieldAlertIcon,
  UserIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Preview, Subsection } from "./section"

export function DropdownMenuShowcase() {
  const [showBadge, setShowBadge] = React.useState(true)
  const [showReason, setShowReason] = React.useState(false)
  const [action, setAction] = React.useState("hide")

  return (
    <Subsection>
      <Preview>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="field" />}>
            Extension menu
            <ChevronDownIcon
              data-icon="inline-end"
              className="text-neutral-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>alex@loupe.app</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserIcon />
                Account
                <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <KeyRoundIcon />
                API keys
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Settings
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>In the feed</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showBadge}
                onCheckedChange={setShowBadge}
              >
                Show hidden-count badge
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showReason}
                onCheckedChange={setShowReason}
              >
                Show filter reason
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filtered posts are</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={action} onValueChange={setAction}>
                <DropdownMenuRadioItem value="hide">
                  Hidden
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="blur">
                  Blurred
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="label">
                  Labeled
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ScanSearchIcon />
                Detectors
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <ShieldAlertIcon />
                  Toxicity
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BotIcon />
                  Bot accounts
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CpuIcon />
                  AI-generated content
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem disabled>
              <PlugIcon />
              TikTok (coming soon)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Preview>
    </Subsection>
  )
}
