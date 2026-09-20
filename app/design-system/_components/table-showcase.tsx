"use client"

import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  BanIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  LinkIcon,
  MoreHorizontalIcon,
  SearchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type Verdict = "hidden" | "blurred" | "labeled" | "kept"

type CollectedPost = {
  id: string
  author: string
  platform: string
  excerpt: string
  verdict: Verdict
  reason: string
  toxicity: number
  collectedAt: string
}

const collectedPosts: CollectedPost[] = [
  {
    id: "post_01",
    author: "@crypto_gains_4u",
    platform: "X",
    excerpt: "🚀 Only 3 spots left! DM me to 10x your wallet today…",
    verdict: "hidden",
    reason: "Bot account",
    toxicity: 12,
    collectedAt: "2026-09-12T09:41:00Z",
  },
  {
    id: "post_02",
    author: "u/quiet_reader",
    platform: "Reddit",
    excerpt: "Here's a thread summarizing the new EU AI Act guidance.",
    verdict: "kept",
    reason: "No match",
    toxicity: 3,
    collectedAt: "2026-09-12T09:38:00Z",
  },
  {
    id: "post_03",
    author: "@hot_takes_daily",
    platform: "X",
    excerpt: "Anyone who votes for them is honestly braindead…",
    verdict: "hidden",
    reason: "Toxicity",
    toxicity: 91,
    collectedAt: "2026-09-12T09:35:00Z",
  },
  {
    id: "post_04",
    author: "@trendwave_ai",
    platform: "LinkedIn",
    excerpt:
      "In today's fast-paced world, synergy is more important than ever.",
    verdict: "labeled",
    reason: "AI-generated",
    toxicity: 2,
    collectedAt: "2026-09-12T09:30:00Z",
  },
  {
    id: "post_05",
    author: "@spoilerzone",
    platform: "YouTube",
    excerpt: "Can't believe the finale ends with the main character…",
    verdict: "blurred",
    reason: "Topic: spoilers",
    toxicity: 8,
    collectedAt: "2026-09-12T09:22:00Z",
  },
  {
    id: "post_06",
    author: "u/devnotes",
    platform: "Reddit",
    excerpt: "Benchmarks for running 3B models on a laptop GPU.",
    verdict: "kept",
    reason: "No match",
    toxicity: 1,
    collectedAt: "2026-09-12T09:15:00Z",
  },
  {
    id: "post_07",
    author: "@newsflash_bot",
    platform: "X",
    excerpt: "BREAKING BREAKING BREAKING click the link below",
    verdict: "hidden",
    reason: "Bot account",
    toxicity: 18,
    collectedAt: "2026-09-12T09:02:00Z",
  },
  {
    id: "post_08",
    author: "@marketing_guru",
    platform: "LinkedIn",
    excerpt: "I fired my entire team. Here's what happened next 👇",
    verdict: "blurred",
    reason: "Engagement bait",
    toxicity: 14,
    collectedAt: "2026-09-12T08:47:00Z",
  },
  {
    id: "post_09",
    author: "@angry_commenter",
    platform: "YouTube",
    excerpt: "Worst video ever, you should quit the internet.",
    verdict: "hidden",
    reason: "Toxicity",
    toxicity: 84,
    collectedAt: "2026-09-12T08:31:00Z",
  },
  {
    id: "post_10",
    author: "@lena_builds",
    platform: "X",
    excerpt: "Shipped a tiny CSS anchor positioning demo, source below.",
    verdict: "kept",
    reason: "No match",
    toxicity: 2,
    collectedAt: "2026-09-12T08:20:00Z",
  },
  {
    id: "post_11",
    author: "@ai_thoughtleader",
    platform: "Facebook",
    excerpt: "Unlock your potential with these 7 transformative habits.",
    verdict: "labeled",
    reason: "AI-generated",
    toxicity: 4,
    collectedAt: "2026-09-12T08:05:00Z",
  },
  {
    id: "post_12",
    author: "u/election_mod",
    platform: "Reddit",
    excerpt: "Megathread: live reactions to tonight's debate.",
    verdict: "blurred",
    reason: "Topic: elections",
    toxicity: 37,
    collectedAt: "2026-09-12T07:50:00Z",
  },
]

const detectorSummary = [
  {
    detector: "Topics",
    model: "Llama 3.2 3B · local",
    checked: 1284,
    filtered: 212,
  },
  {
    detector: "Toxicity",
    model: "Detoxify · in-browser",
    checked: 1284,
    filtered: 97,
  },
  {
    detector: "Bot accounts",
    model: "Heuristics + Claude Haiku",
    checked: 642,
    filtered: 58,
  },
  {
    detector: "AI content",
    model: "Claude Haiku · your key",
    checked: 1284,
    filtered: 143,
  },
]

const numberFormatter = new Intl.NumberFormat("en-US")

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
})

const verdictStyles: Record<Verdict, string> = {
  hidden: "bg-neutral-background text-neutral-foreground",
  /* text-action-brand-background, not text-brand-background: brand on brand-subtle is only 4.29:1 */
  blurred: "bg-brand-subtle text-action-brand-background",
  labeled: "bg-info-subtle text-info-background",
  kept: "bg-success-subtle text-success-background",
}

const features = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns,
  filterFns,
})

const columnHelper = createColumnHelper<typeof features, CollectedPost>()

function VerdictPill({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium capitalize",
        verdictStyles[verdict]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {verdict}
    </span>
  )
}

function ToxicityScore({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-background">
        <div
          className={cn(
            "h-full rounded-full",
            value >= 70 ? "bg-danger-background" : "bg-brand-background"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono font-medium tabular-nums">
        {value}
      </span>
    </div>
  )
}

function SortButton({
  sorted,
  onClick,
  children,
}: {
  sorted: false | "asc" | "desc"
  onClick: () => void
  children: React.ReactNode
}) {
  const Icon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon

  return (
    <Button variant="ghost" size="sm" className="-mx-3" onClick={onClick}>
      {children}
      <Icon
        data-icon="inline-end"
        className={cn(!sorted && "text-neutral-foreground")}
      />
    </Button>
  )
}

function RowActions({ post }: { post: CollectedPost }) {
  function copyLink() {
    navigator.clipboard
      .writeText(`https://morfeed.app/posts/${post.id}`)
      .then(() =>
        toast.add({ title: "Post link copied", description: post.id })
      )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for post by ${post.author}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={copyLink}>
          <LinkIcon />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExternalLinkIcon />
          Open on {post.platform}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <BanIcon />
          Mute {post.author}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all posts"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select post by ${row.original.author}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("author", {
    header: ({ column }) => (
      <SortButton
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Post
      </SortButton>
    ),
    cell: ({ row }) => (
      <div className="flex max-w-52 flex-col">
        <span className="font-medium">
          {row.original.author}
          <span className="font-normal text-neutral-foreground">
            {" "}
            · {row.original.platform}
          </span>
        </span>
        <span className="truncate text-xs text-neutral-foreground">
          {row.original.excerpt}
        </span>
      </div>
    ),
    filterFn: "includesString",
  }),
  columnHelper.accessor("verdict", {
    header: "Verdict",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <VerdictPill verdict={row.original.verdict} />
        <span className="text-xs text-neutral-foreground">
          {row.original.reason}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("toxicity", {
    header: ({ column }) => (
      <div className="flex justify-end">
        <SortButton
          sorted={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Toxicity
        </SortButton>
      </div>
    ),
    cell: ({ getValue }) => <ToxicityScore value={getValue()} />,
  }),
  columnHelper.accessor("collectedAt", {
    id: "collected",
    header: ({ column }) => (
      <SortButton
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Collected
      </SortButton>
    ),
    cell: ({ getValue }) => (
      <span className="text-neutral-foreground tabular-nums">
        {timeFormatter.format(new Date(getValue()))}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <RowActions post={row.original} />
      </div>
    ),
    enableHiding: false,
  }),
])

function CollectedPostsCard() {
  const table = useTable({
    features,
    columns,
    data: collectedPosts,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  const authorColumn = table.getColumn("author")
  const rows = table.getRowModel().rows

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collected posts</CardTitle>
        <CardDescription>
          Everything Morfeed read from your feeds, with the verdict each
          detector reached.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <DownloadIcon data-icon="inline-start" />
            Export JSON
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Filter by author…"
              aria-label="Filter by author"
              value={String(authorColumn?.getFilterValue() ?? "")}
              onChange={(event) =>
                authorColumn?.setFilterValue(event.target.value)
              }
            />
          </InputGroup>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="ml-auto" />
              }
            >
              Columns
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(visible) =>
                        column.toggleVisibility(visible)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="overflow-hidden rounded-3xl border">
          <Table>
            <TableHeader className="bg-neutral-subtle">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-24 text-center text-neutral-foreground"
                  >
                    No posts match this author.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-3">
        <p className="text-sm text-neutral-foreground tabular-nums">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} post(s) selected
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-foreground tabular-nums">
            Page {table.state.pagination.pageIndex + 1} of{" "}
            {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function DetectorSummaryCard() {
  const totalFiltered = detectorSummary.reduce(
    (sum, row) => sum + row.filtered,
    0
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Detectors</CardTitle>
        <CardDescription>
          Static table with TableCaption and TableFooter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Last 24 hours across all platforms.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Detector</TableHead>
              <TableHead className="text-right">Checked</TableHead>
              <TableHead className="text-right">Filtered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detectorSummary.map((row) => (
              <TableRow key={row.detector}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.detector}</span>
                    <span className="text-xs text-neutral-foreground">
                      {row.model}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {numberFormatter.format(row.checked)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {numberFormatter.format(row.filtered)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total filtered</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {numberFormatter.format(totalFiltered)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}

export function TableShowcase() {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <CollectedPostsCard />
      <DetectorSummaryCard />
    </div>
  )
}
