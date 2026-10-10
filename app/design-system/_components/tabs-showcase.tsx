import {
  BlocksIcon,
  CpuIcon,
  EyeIcon,
  EyeOffIcon,
  LayoutGridIcon,
  ListIcon,
  MousePointerClickIcon,
  ShieldIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Preview, Subsection } from "./section"

const panelCopy = {
  feed: "Posts that passed your filters, in their original order.",
  hidden: "Everything Loupe removed, grouped by the rule that matched.",
  insights: "Toxicity, bot and AI-content trends across your platforms.",
}

export function TabsShowcase() {
  return (
    <>
      <Subsection className="grid gap-4 md:grid-cols-2">
        <Preview>
          <Tabs defaultValue="feed" className="w-full">
            <TabsList>
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="hidden">Hidden</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="automations" disabled>
                Automations
              </TabsTrigger>
            </TabsList>
            {Object.entries(panelCopy).map(([value, copy]) => (
              <TabsContent
                key={value}
                value={value}
                className="pt-2 text-neutral-foreground"
              >
                {copy}
              </TabsContent>
            ))}
          </Tabs>
        </Preview>
        <Preview>
          <Tabs defaultValue="feed" className="w-full">
            <TabsList variant="line">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="hidden">Hidden</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            {Object.entries(panelCopy).map(([value, copy]) => (
              <TabsContent
                key={value}
                value={value}
                className="pt-2 text-neutral-foreground"
              >
                {copy}
              </TabsContent>
            ))}
          </Tabs>
        </Preview>
        <Preview>
          <Tabs defaultValue="blur">
            <TabsList>
              <TabsTrigger value="blur">
                <EyeIcon />
                Blur
              </TabsTrigger>
              <TabsTrigger value="hide">
                <EyeOffIcon />
                Hide
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="grid">
            <TabsList>
              <TabsTrigger value="grid" aria-label="Card view">
                <LayoutGridIcon />
              </TabsTrigger>
              <TabsTrigger value="list" aria-label="List view">
                <ListIcon />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Preview>
        <Preview>
          <Tabs
            defaultValue="models"
            orientation="vertical"
            className="w-full gap-6"
          >
            <TabsList>
              <TabsTrigger value="models">
                <CpuIcon />
                Models
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <ShieldIcon />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="automations">
                <MousePointerClickIcon />
                Automations
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <BlocksIcon />
                Integrations
              </TabsTrigger>
            </TabsList>
            <TabsContent value="models" className="text-neutral-foreground">
              API keys, local endpoints and which model runs each detector.
            </TabsContent>
            <TabsContent value="privacy" className="text-neutral-foreground">
              What gets collected from the DOM and how long it&apos;s kept.
            </TabsContent>
            <TabsContent
              value="automations"
              className="text-neutral-foreground"
            >
              Auto-click &ldquo;Not interested&rdquo;, expand posts, mute
              authors.
            </TabsContent>
            <TabsContent
              value="integrations"
              className="text-neutral-foreground"
            >
              Send collected posts to a webhook, Notion or a CSV export.
            </TabsContent>
          </Tabs>
        </Preview>
      </Subsection>
    </>
  )
}
