/* Dashboard for local analysis history */
import { Download, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { HISTORY_CHANNEL, HISTORY_RETENTION_DAYS, MAX_HISTORY_RECORDS } from "../../src/core/constants";
import { loadState, saveState } from "../../src/core/storage";
import type { HistorySettings, StoredState } from "../../src/core/types";
import { clearRecords, listRecords, pruneRecords } from "../../src/history/db";
import { ALL_FILTERS, filterRecords, summarize, type HistoryFilters } from "../../src/history/filter";
import type { HistoryRecord } from "../../src/history/record";

const PAGE_SIZE = 100;
const SELECT_CLASS = "h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";
const siteLabels: Record<HistoryRecord["site"], string> = { reddit: "Reddit", youtube: "YouTube" };
const actionLabels: Record<HistoryRecord["action"], string> = { none: "Not matched", mark: "Marked", hide: "Hidden", remove: "Removed" };
const timeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

export function App() {
  const [state, setState] = useState<StoredState | null>(null);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filters, setFilters] = useState<HistoryFilters>(ALL_FILTERS);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [confirmingClear, setConfirmingClear] = useState(false);
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
    setConfirmingClear(false);
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

  if (!state) return <main className="p-6 text-sm">Loading…</main>;
  const filtered = filterRecords(records, filters);
  const summary = summarize(filtered);
  const ruleOptions = summarize(records).rules;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Posts and videos that Loupe analyzed. Stored only in this browser and deleted after {state.history.retentionDays} {state.history.retentionDays === 1 ? "day" : "days"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={state.history.enabled} label="Record history" onCheckedChange={(enabled) => void updateHistory({ enabled })} />
            Record history
          </label>
          <select
            aria-label="Keep history for"
            className={SELECT_CLASS}
            value={state.history.retentionDays}
            onChange={(event) => void updateHistory({ retentionDays: Number(event.target.value) })}
          >
            {HISTORY_RETENTION_DAYS.map((days) => <option key={days} value={days}>Keep {days} {days === 1 ? "day" : "days"}</option>)}
          </select>
          <Button variant="outline" size="sm" disabled={!filtered.length} onClick={() => exportJson(filtered)}>
            <Download className="size-3.5" /> Export {filtered.length.toLocaleString()}
          </Button>
          {confirmingClear ? (
            <span className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={() => void clearHistory()}>Delete all records</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(false)}>Cancel</Button>
            </span>
          ) : (
            <Button variant="ghost" size="sm" className="text-red-600" disabled={!records.length} onClick={() => setConfirmingClear(true)}>
              <Trash2 className="size-3.5" /> Clear history
            </Button>
          )}
        </div>
      </header>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
      {!state.history.enabled && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          History is off. Loupe keeps analyzing, but it does not save new records.
        </p>
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
          <select aria-label="Site" className={SELECT_CLASS} value={filters.site} onChange={(event) => updateFilters({ site: event.target.value as HistoryFilters["site"] })}>
            <option value="all">All sites</option>
            <option value="reddit">Reddit</option>
            <option value="youtube">YouTube</option>
          </select>
          <select aria-label="Action" className={SELECT_CLASS} value={filters.action} onChange={(event) => updateFilters({ action: event.target.value as HistoryFilters["action"] })}>
            <option value="all">All results</option>
            <option value="none">Not matched</option>
            <option value="mark">Marked</option>
            <option value="hide">Hidden</option>
            <option value="remove">Removed</option>
          </select>
        </div>
        {ruleOptions.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by rule">
            {ruleOptions.map((rule) => (
              <button
                key={rule.ruleId}
                type="button"
                aria-pressed={filters.ruleId === rule.ruleId}
                onClick={() => updateFilters({ ruleId: filters.ruleId === rule.ruleId ? "all" : rule.ruleId })}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs aria-pressed:border-zinc-900 aria-pressed:ring-1 aria-pressed:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:aria-pressed:border-zinc-100 dark:aria-pressed:ring-zinc-100"
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: rule.ruleColor }} />
                {rule.ruleName}
                <span className="tabular-nums text-zinc-500">{rule.count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {records.length ? "No records match these filters." : "No history yet. Browse Reddit or YouTube with Loupe enabled."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2 font-medium">Analyzed</th>
                <th className="px-4 py-2 font-medium">Site</th>
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filtered.slice(0, visible).map((record) => (
                <tr key={record.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{timeFormat.format(record.lastAnalyzed)}</td>
                  <td className="px-4 py-3 text-xs">{siteLabels[record.site]}</td>
                  <td className="px-4 py-3">
                    {record.url ? (
                      <a href={record.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-medium hover:underline">
                        {record.title} <ExternalLink className="mt-1 size-3 shrink-0 text-zinc-400" />
                      </a>
                    ) : (
                      <span className="font-medium">{record.title}</span>
                    )}
                    <p className="text-xs text-zinc-500">{record.source}</p>
                    {record.matches.map((match) => (
                      <p key={match.ruleId} className="mt-1 flex items-start gap-1.5 text-xs">
                        <span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: match.ruleColor }} />
                        <span><span className="font-semibold">{match.ruleName}</span>{match.reason ? `: ${match.reason}` : ""}</span>
                      </p>
                    ))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{actionLabels[record.action]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible < filtered.length && (
            <div className="border-t border-zinc-200 p-3 text-center dark:border-zinc-800">
              <Button variant="ghost" size="sm" onClick={() => setVisible(visible + PAGE_SIZE)}>
                Show more ({(filtered.length - visible).toLocaleString()} left)
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
