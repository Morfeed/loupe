"use client"

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const dailyScans = [
  { day: "Monday", scanned: 1420, filtered: 186 },
  { day: "Tuesday", scanned: 1680, filtered: 305 },
  { day: "Wednesday", scanned: 1310, filtered: 237 },
  { day: "Thursday", scanned: 1540, filtered: 173 },
  { day: "Friday", scanned: 1890, filtered: 209 },
  { day: "Saturday", scanned: 2210, filtered: 264 },
  { day: "Sunday", scanned: 1970, filtered: 248 },
]

const scanConfig = {
  scanned: { label: "Scanned", color: "var(--chart-1)" },
  filtered: { label: "Filtered", color: "var(--chart-4)" },
} satisfies ChartConfig

const platformHits = [
  { platform: "X", toxicity: 186, ai: 80 },
  { platform: "Reddit", toxicity: 105, ai: 42 },
  { platform: "YouTube", toxicity: 137, ai: 60 },
  { platform: "LinkedIn", toxicity: 23, ai: 190 },
  { platform: "Facebook", toxicity: 89, ai: 130 },
]

const platformConfig = {
  toxicity: { label: "Toxicity", color: "var(--chart-2)" },
  ai: { label: "AI-generated", color: "var(--chart-4)" },
} satisfies ChartConfig

const toxicityTrend = [
  { day: "Monday", raw: 41, filtered: 12 },
  { day: "Tuesday", raw: 48, filtered: 14 },
  { day: "Wednesday", raw: 39, filtered: 11 },
  { day: "Thursday", raw: 52, filtered: 13 },
  { day: "Friday", raw: 57, filtered: 15 },
  { day: "Saturday", raw: 44, filtered: 10 },
  { day: "Sunday", raw: 46, filtered: 11 },
]

const toxicityConfig = {
  raw: { label: "Raw feed", color: "var(--chart-2)" },
  filtered: { label: "After Loupe", color: "var(--chart-4)" },
} satisfies ChartConfig

const filterReasons = [
  { reason: "topic", posts: 212, fill: "var(--color-topic)" },
  { reason: "ai", posts: 143, fill: "var(--color-ai)" },
  { reason: "toxicity", posts: 97, fill: "var(--color-toxicity)" },
  { reason: "bot", posts: 58, fill: "var(--color-bot)" },
  { reason: "bait", posts: 41, fill: "var(--color-bait)" },
]

const reasonConfig = {
  posts: { label: "Posts" },
  topic: { label: "Topic", color: "var(--chart-1)" },
  ai: { label: "AI-generated", color: "var(--chart-2)" },
  toxicity: { label: "Toxicity", color: "var(--chart-3)" },
  bot: { label: "Bot account", color: "var(--chart-4)" },
  bait: { label: "Engagement bait", color: "var(--chart-5)" },
} satisfies ChartConfig

const totalFiltered = filterReasons.reduce((sum, item) => sum + item.posts, 0)

function shortDay(value: string) {
  return value.slice(0, 3)
}

function ChartCard({
  title,
  description,
  insight,
  change,
  className,
  children,
}: {
  title: string
  description: string
  insight: string
  change: number
  className?: string
  children: React.ReactNode
}) {
  const TrendIcon = change >= 0 ? TrendingUpIcon : TrendingDownIcon

  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <div className="flex items-center gap-2 font-medium">
          {insight} {change >= 0 ? "+" : "−"}
          {Math.abs(change)}%
          <TrendIcon className="size-4" />
        </div>
        <span className="text-neutral-foreground">Last 7 days</span>
      </CardFooter>
    </Card>
  )
}

export function ChartShowcase() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ChartCard
        title="Area · with gradient"
        description="Posts scanned vs filtered per day"
        insight="Filtered share this week"
        change={5.2}
        className="lg:col-span-2"
      >
        <ChartContainer config={scanConfig} className="aspect-auto h-72 w-full">
          <AreaChart data={dailyScans} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fill-scanned" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-scanned)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-scanned)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fill-filtered" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-filtered)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-filtered)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={shortDay}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="scanned"
              type="natural"
              fill="url(#fill-scanned)"
              stroke="var(--color-scanned)"
            />
            <Area
              dataKey="filtered"
              type="natural"
              fill="url(#fill-filtered)"
              stroke="var(--color-filtered)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Pie · donut with label"
        description="Why posts were filtered"
        insight="AI-generated posts"
        change={12.4}
      >
        <ChartContainer
          config={reasonConfig}
          className="mx-auto aspect-square max-h-72"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={filterReasons}
              dataKey="posts"
              nameKey="reason"
              innerRadius={64}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                    return null
                  }

                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-semibold"
                      >
                        {totalFiltered.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 24}
                        className="fill-neutral-foreground"
                      >
                        Filtered
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Bar · grouped"
        description="Detector hits by platform"
        insight="LinkedIn AI-content hits"
        change={8.1}
      >
        <ChartContainer
          config={platformConfig}
          className="aspect-auto h-60 w-full"
        >
          <BarChart data={platformHits} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="platform"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="toxicity" fill="var(--color-toxicity)" radius={8} />
            <Bar dataKey="ai" fill="var(--color-ai)" radius={8} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Line · with dots"
        description="Average toxicity score seen"
        insight="Toxicity you actually saw"
        change={-71.3}
      >
        <ChartContainer
          config={toxicityConfig}
          className="aspect-auto h-60 w-full"
        >
          <LineChart
            data={toxicityTrend}
            margin={{ left: 12, right: 12, top: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={shortDay}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="raw"
              type="monotone"
              stroke="var(--color-raw)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              dataKey="filtered"
              type="monotone"
              stroke="var(--color-filtered)"
              strokeWidth={2}
              dot={{ fill: "var(--color-filtered)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Radial · bars"
        description="Filtered posts by reason"
        insight="Bot accounts caught"
        change={3.6}
      >
        <ChartContainer
          config={reasonConfig}
          className="mx-auto aspect-square max-h-60"
        >
          <RadialBarChart
            data={filterReasons}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="reason" />}
            />
            <RadialBar dataKey="posts" background />
          </RadialBarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
