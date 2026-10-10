import {
  ArrowUpRightIcon,
  FilterIcon,
  PlugZapIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SearchXIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { Subsection } from "./section"

export function EmptyShowcase() {
  return (
    <Subsection className="grid gap-6 md:grid-cols-2">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FilterIcon />
          </EmptyMedia>
          <EmptyTitle>No filter rules yet</EmptyTitle>
          <EmptyDescription>
            Create a rule to start hiding posts by topic, toxicity, bot accounts
            or AI-generated content.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Button>
              <PlusIcon data-icon="inline-start" />
              Create rule
            </Button>
            <Button variant="outline">Import rule set</Button>
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-neutral-foreground"
            render={<a href="#empty" />}
            nativeButton={false}
          >
            How filtering works
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </EmptyContent>
      </Empty>

      <Empty className="bg-neutral-subtle">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PlugZapIcon />
          </EmptyMedia>
          <EmptyTitle>Extension not detected</EmptyTitle>
          <EmptyDescription>
            Install or enable the Loupe extension, then check again to pair
            this browser.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm">
            <RefreshCwIcon data-icon="inline-start" />
            Check again
          </Button>
        </EmptyContent>
      </Empty>

      <Card>
        <CardContent>
          <Empty className="p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>No collected posts found</EmptyTitle>
              <EmptyDescription>
                Nothing matches &ldquo;crypto giveaway&rdquo; in the last 30
                days. Try another keyword or platform.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search collected posts…"
                  aria-label="Search collected posts"
                />
              </InputGroup>
              <EmptyDescription>
                Data collection is off? <a href="#empty">Turn it on</a>
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>

      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia>
            <ShieldCheckIcon
              className="size-14 text-neutral-foreground"
              strokeWidth={1.25}
            />
          </EmptyMedia>
          <EmptyTitle>Your feed is clean</EmptyTitle>
          <EmptyDescription>
            Nothing has been filtered today. Hidden posts will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Subsection>
  )
}
