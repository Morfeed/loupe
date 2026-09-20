import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

import { Preview, Subsection } from "./section"

export function SkeletonShowcase() {
  return (
    <Subsection className="grid gap-4 md:grid-cols-2">
      <Preview>
        <div className="flex w-full flex-col gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
          <Skeleton className="h-28 w-full rounded-3xl" />
        </div>
      </Preview>
      <Preview className="justify-center gap-6">
        <Spinner className="size-3" />
        <Spinner />
        <Spinner className="size-6 text-neutral-foreground" />
        <Spinner className="size-8 text-brand-background" />
        <Button disabled>
          <Spinner data-icon="inline-start" />
          Classifying
        </Button>
        <Button variant="outline" disabled>
          <Spinner data-icon="inline-start" />
          Loading model
        </Button>
      </Preview>
    </Subsection>
  )
}
