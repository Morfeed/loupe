import { ClockIcon, LockIcon } from "lucide-react"

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Separator } from "@/components/ui/separator"

import { Preview, Subsection } from "./section"

export function SeparatorShowcase() {
  return (
    <Subsection className="grid gap-4 md:grid-cols-2">
      <Preview>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Loupe</span>
            <span className="text-sm text-neutral-foreground">
              Filters social feeds right in the page.
            </span>
          </div>
          <Separator />
          <div className="flex h-5 items-center gap-4 text-sm">
            <span>Rules</span>
            <Separator orientation="vertical" />
            <span>Detectors</span>
            <Separator orientation="vertical" />
            <span>Data</span>
          </div>
        </div>
      </Preview>
      <Preview>
        <div className="flex w-full flex-col gap-5">
          <Marker>
            <MarkerIcon>
              <LockIcon />
            </MarkerIcon>
            <MarkerContent>Posts are classified on your device.</MarkerContent>
          </Marker>
          <Marker variant="separator">
            <MarkerContent>Today</MarkerContent>
          </Marker>
          <Marker>
            <MarkerIcon>
              <ClockIcon />
            </MarkerIcon>
            <MarkerContent>Last feed scan 2 minutes ago</MarkerContent>
          </Marker>
        </div>
      </Preview>
    </Subsection>
  )
}
