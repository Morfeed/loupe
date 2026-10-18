/* Dashboard for local analysis history */
import { Download, ExternalLink, History, PauseCircle, SearchX, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { HISTORY_CHANNEL, HISTORY_RETENTION_DAYS, MAX_HISTORY_RECORDS, SITE_IDS, SITES } from "../../src/core/constants";
import { loadState, saveState } from "../../src/core/storage";
import type { HistorySettings, StoredState } from "../../src/core/types";
import { clearRecords, listRecords, pruneRecords } from "../../src/history/db";
import { ALL_FILTERS, filterRecords, summarize, type HistoryFilters } from "../../src/history/filter";
import type { HistoryRecord } from "../../src/history/record";

const PAGE_SIZE = 100;
const actionLabels: Record<HistoryRecord["action"], string> = { none: "Not matched", mark: "Marked", hide: "Hidden", remove: "Removed" };
const timeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/* Base UI Select shows the label of the selected value only when it receives the items */
const retentionItems = HISTORY_RETENTION_DAYS.map((days) => ({ value: days, label: `Keep ${days} ${days === 1 ? "day" : "days"}` }));
const siteItems: { value: HistoryFilters["site"]; label: string }[] = [
  { value: "all", label: "All sites" },
  ...SITE_IDS.map((site) => ({ value: site, label: SITES[site].label })),
];
const actionItems: { value: HistoryFilters["action"]; label: string }[] = [
  { value: "all", label: "All results" },
  { value: "none", label: actionLabels.none },
  { value: "mark", label: actionLabels.mark },
  { value: "hide", label: actionLabels.hide },
  { value: "remove", label: actionLabels.remove },
];

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function App() {
  const [state, setState] = useState<StoredState | null>(null);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filters, setFilters] = useState<HistoryFilters>(ALL_FILTERS);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [clearOpen, setClearOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function reload() {
      listRecords().then(setRecords, () => setError("Loupe could not read the history database."));
    }
    function reloadState() {
      void loadState().then(setState);
    }
    void loadState().then(async (loaded) => {
      setState(loaded);
      await pruneRecords(loaded.history.retentionDays, MAX_HISTORY_RECORDS, Date.now()).catch(() => undefined);
      reload();
    });
    const channel = new BroadcastChannel(HISTORY_CHANNEL);
    channel.onmessage = reload;
    browser.storage.onChanged.addListener(reloadState);
    return () => {
      channel.close();
      browser.storage.onChanged.removeListener(reloadState);
    };
  }, []);

  /* Read the latest state first. The popup can change rules while this page is open. */
  async function updateHistory(patch: Partial<HistorySettings>) {
    const latest = await loadState();
    const next = { ...latest, history: { ...latest.history, ...patch } };
    setState(next);
    await saveState(next);
    if (patch.retentionDays === undefined) return;
    await pruneRecords(next.history.retentionDays, MAX_HISTORY_RECORDS, Date.now());
    setRecords(await listRecords());
  }

  function updateFilters(patch: Partial<HistoryFilters>) {
    setFilters({ ...filters, ...patch });
    setVisible(PAGE_SIZE);
  }

  async function clearHistory() {
    await clearRecords();
    setRecords([]);
    setClearOpen(false);
  }

  function exportJson(selection: HistoryRecord[]) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(selection, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `loupe-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    /* Revoke after the click task so that the download can start */
    setTimeout(() => URL.revokeObjectURL(url));
  }

  if (!state) return <main className="p-6 text-sm text-neutral-foreground">Loading…</main>;
  const filtered = filterRecords(records, filters);
  const summary = summarize(filtered);
  const ruleOptions = summarize(records).rules;

  return (
    <div className="min-h-screen bg-dashboard-background">
      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold">History</h1>
            <p className="mt-1 text-sm text-neutral-foreground">
              Posts and videos that Loupe analyzed. Stored only in this browser and deleted after {state.history.retentionDays}{" "}
              {state.history.retentionDays === 1 ? "day" : "days"}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={state.history.enabled} onCheckedChange={(enabled) => void updateHistory({ enabled })} />
              Record history
            </label>
            <Select
              items={retentionItems}
              value={state.history.retentionDays}
              onValueChange={(retentionDays) => {
                if (retentionDays !== null) void updateHistory({ retentionDays });
              }}
            >
              <SelectTrigger size="sm" aria-label="Keep history for">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {retentionItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled={!filtered.length} onClick={() => exportJson(filtered)}>
              <Download data-icon="inline-start" /> Export {filtered.length.toLocaleString()}
            </Button>
            <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
              <AlertDialogTrigger render={<Button variant="destructive" size="sm" disabled={!records.length} />}>
                <Trash2 data-icon="inline-start" /> Clear history
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-danger-subtle text-danger-background">
                    <Trash2 />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Loupe deletes all {records.length.toLocaleString()} records from this browser. You cannot undo this.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => void clearHistory()}>
                    Delete all records
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>History unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!state.history.enabled && (
          <Alert>
            <PauseCircle />
            <AlertTitle>History is off</AlertTitle>
            <AlertDescription>Loupe keeps analyzing, but it does not save new records.</AlertDescription>
          </Alert>
        )}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Summary">
          <Stat label="Analyzed" value={summary.analyzed} />
          <Stat label="Matched" value={summary.matched} />
          <Stat label="Hidden" value={summary.hidden} />
          <Stat label="Removed" value={summary.removed} />
        </section>

        <section className="space-y-3" aria-label="Filters">
          <div className="flex flex-wrap gap-2">
            <Input
              aria-label="Search titles and sources"
              className="max-w-xs"
              placeholder="Search titles, subreddits, channels…"
              value={filters.query}
              onChange={(event) => updateFilters({ query: event.target.value })}
            />
            <Select items={siteItems} value={filters.site} onValueChange={(site) => site && updateFilters({ site })}>
              <SelectTrigger aria-label="Site">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {siteItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select items={actionItems} value={filters.action} onValueChange={(action) => action && updateFilters({ action })}>
              <SelectTrigger aria-label="Action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {ruleOptions.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by rule">
              {ruleOptions.map((rule) => (
                <Toggle
                  key={rule.ruleId}
                  variant="outline"
                  size="sm"
                  pressed={filters.ruleId === rule.ruleId}
                  onPressedChange={(pressed) => updateFilters({ ruleId: pressed ? rule.ruleId : "all" })}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: rule.ruleColor }} />
                  {rule.ruleName}
                  <span className="text-neutral-foreground tabular-nums">{rule.count}</span>
                </Toggle>
              ))}
            </div>
          )}
        </section>

        {filtered.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">{records.length ? <SearchX /> : <History />}</EmptyMedia>
              <EmptyTitle>{records.length ? "No matching records" : "No history yet"}</EmptyTitle>
              <EmptyDescription>
                {records.length ? "No records match these filters." : "Browse a site that Loupe analyzes."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Analyzed</TableHead>
                  <TableHead className="px-4">Site</TableHead>
                  <TableHead className="px-4">Item</TableHead>
                  <TableHead className="px-4">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, visible).map((record) => (
                  <TableRow key={record.id} className="align-top">
                    <TableCell className="px-4 py-3 text-xs text-neutral-foreground">{timeFormat.format(record.lastAnalyzed)}</TableCell>
                    <TableCell className="px-4 py-3 text-xs">{SITES[record.site].label}</TableCell>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      {record.url ? (
                        <a href={record.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-medium hover:underline">
                          {record.title} <ExternalLink className="mt-1 size-3 shrink-0 text-neutral-foreground" />
                        </a>
                      ) : (
                        <span className="font-medium">{record.title}</span>
                      )}
                      {record.source && <p className="text-xs text-neutral-foreground">{record.source}</p>}
                      {record.matches.map((match) => (
                        <p key={match.ruleId} className="mt-1 flex items-start gap-1.5 text-xs">
                          <span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: match.ruleColor }} />
                          <span>
                            <span className="font-semibold">{match.ruleName}</span>
                            {match.reason ? `: ${match.reason}` : ""}
                          </span>
                        </p>
                      ))}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs">{actionLabels[record.action]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {visible < filtered.length && (
              <div className="border-t p-3 text-center">
                <Button variant="ghost" size="sm" onClick={() => setVisible(visible + PAGE_SIZE)}>
                  Show more ({(filtered.length - visible).toLocaleString()} left)
                </Button>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
