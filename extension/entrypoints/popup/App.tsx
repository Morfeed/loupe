import { ArrowDown, ArrowUp, Cloud, History, LayoutDashboard, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { MAX_RULES, PROVIDERS, RULE_ACTIONS, RULE_COLORS, SITE_IDS, SITES } from "../../src/core/constants";
import { createRule, moveRule } from "../../src/core/rules";
import { hasReadyProvider, loadState, saveState } from "../../src/core/storage";
import type { ExtensionMessage, ExtensionResponse, Rule, RuleAction, StoredState, TabStatus } from "../../src/core/types";

const statusLabels: Record<TabStatus["status"], string> = {
  "setup-required": "Setup required",
  ready: "Ready",
  analyzing: "Analyzing",
  paused: "Paused",
  error: "Error",
};

const actionLabels: Record<RuleAction, { label: string; hint: string }> = {
  mark: { label: "Mark", hint: "Badge and border" },
  hide: { label: "Hide", hint: "Collapse with a Show button" },
  remove: { label: "Remove", hint: "Hide the post completely" },
};

async function openDashboard() {
  const url = browser.runtime.getURL("/dashboard.html");
  const [existing] = await browser.tabs.query({ url });
  if (existing?.id === undefined) {
    await browser.tabs.create({ url });
  } else {
    await browser.tabs.update(existing.id, { active: true });
    if (existing.windowId !== undefined) await browser.windows.update(existing.windowId, { focused: true });
  }
  window.close();
}

export function App() {
  const [state, setState] = useState<StoredState | null>(null);
  const [status, setStatus] = useState<TabStatus>({ status: "setup-required" });

  useEffect(() => {
    void Promise.all([
      loadState().then(setState),
      browser.runtime.sendMessage({ type: "GET_TAB_STATUS" } satisfies ExtensionMessage).then((rawResponse) => {
        const response = rawResponse as ExtensionResponse;
        if (response.ok && response.status) setStatus(response.status);
      }),
    ]);
  }, []);

  async function commit(next: StoredState) {
    setState(next);
    await saveState(next);
    setStatus({ status: !hasReadyProvider(next) ? "setup-required" : next.enabled ? "ready" : "paused" });
  }

  async function updateRule(id: string, patch: Partial<Rule>) {
    if (!state) return;
    await commit({ ...state, rules: state.rules.map((rule) => rule.id === id ? { ...rule, ...patch } : rule) });
  }

  if (!state) return <main className="w-[390px] p-4 text-sm">Loading…</main>;
  const providerLabel = PROVIDERS[state.provider.kind].label;

  return (
    <main className="w-[390px] max-h-[600px] overflow-y-auto">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold">Loupe</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
              <span className="size-2 rounded-full bg-blue-500" />
              {statusLabels[status.status]}
              <span className="flex items-center gap-1"><Cloud className="size-3" /> Cloud</span>
              <span className="flex items-center gap-1">
                <History className="size-3" />
                {state.history.enabled ? `History · ${state.history.retentionDays}d` : "History off"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={state.enabled}
              disabled={!state.cloudConsent}
              label="Enable Loupe"
              onCheckedChange={(enabled) => void commit({ ...state, enabled })}
            />
            <Button variant="ghost" size="icon" aria-label="Open dashboard" title="Dashboard" onClick={() => void openDashboard()}>
              <LayoutDashboard className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Open settings" onClick={() => void browser.runtime.openOptionsPage()}>
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
        {status.message && <p className="mt-2 text-xs text-red-600">{status.message}</p>}
      </header>

      <section className="space-y-3 p-4">
        {!state.cloudConsent && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <p>Loupe sends your enabled rules and this content to {providerLabel} for analysis:</p>
            <ul className="mt-1 list-disc pl-4">
              {SITE_IDS.map((site) => <li key={site}>{SITES[site].sends}</li>)}
            </ul>
            <Button className="mt-3" size="sm" onClick={() => void commit({ ...state, cloudConsent: true })}>Allow cloud analysis</Button>
          </div>
        )}

        {!hasReadyProvider(state) && (
          <button className="w-full rounded-lg border border-amber-300 bg-amber-50 p-3 text-left text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100" onClick={() => void browser.runtime.openOptionsPage()}>
            Add and verify your {providerLabel} API key to start.
          </button>
        )}

        <div>
          <h2 className="font-semibold">Sites</h2>
          <p className="text-xs text-zinc-500">Loupe analyzes only the sites that you turn on.</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SITE_IDS.map((site) => (
              <label key={site} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-950">
                {SITES[site].label}
                <Switch
                  checked={state.sites[site]}
                  label={`Analyze ${SITES[site].label}`}
                  onCheckedChange={(enabled) => void commit({ ...state, sites: { ...state.sites, [site]: enabled } })}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Rules</h2>
            <p className="text-xs text-zinc-500">{state.rules.length} of {MAX_RULES}</p>
          </div>
          <Button
            size="sm"
            disabled={state.rules.length >= MAX_RULES}
            onClick={() => void commit({ ...state, rules: [...state.rules, createRule(state.rules.length)] })}
          >
            <Plus className="size-3.5" /> Add rule
          </Button>
        </div>

        {state.rules.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 p-5 text-center text-xs text-zinc-500 dark:border-zinc-700">
            Add a rule such as “Job postings” or “Toxic posts”.
          </div>
        )}

        {state.rules.map((rule, index) => (
          <article key={rule.id} className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <Switch checked={rule.enabled} label={`Enable ${rule.name}`} onCheckedChange={(enabled) => void updateRule(rule.id, { enabled })} />
              <Input
                aria-label="Rule name"
                maxLength={40}
                value={rule.name}
                onChange={(event) => setState({ ...state, rules: state.rules.map((item) => item.id === rule.id ? { ...item, name: event.target.value } : item) })}
                onBlur={() => void saveState(state)}
              />
              <Button variant="ghost" size="icon" aria-label="Move rule up" disabled={index === 0} onClick={() => void commit({ ...state, rules: moveRule(state.rules, index, -1) })}><ArrowUp className="size-3.5" /></Button>
              <Button variant="ghost" size="icon" aria-label="Move rule down" disabled={index === state.rules.length - 1} onClick={() => void commit({ ...state, rules: moveRule(state.rules, index, 1) })}><ArrowDown className="size-3.5" /></Button>
            </div>
            <Textarea
              aria-label={`Criterion for ${rule.name}`}
              maxLength={500}
              placeholder="Describe what should match…"
              value={rule.criterion}
              onChange={(event) => setState({ ...state, rules: state.rules.map((item) => item.id === rule.id ? { ...item, criterion: event.target.value } : item) })}
              onBlur={() => void saveState(state)}
            />
            <div className="flex items-center gap-2">
              <fieldset className="flex shrink-0 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
                <legend className="sr-only">Action for {rule.name}</legend>
                {RULE_ACTIONS.map((action) => (
                  <label key={action}>
                    <input
                      type="radio"
                      className="peer sr-only"
                      name={`action-${rule.id}`}
                      value={action}
                      checked={rule.action === action}
                      onChange={() => void updateRule(rule.id, { action })}
                    />
                    <span className="block cursor-pointer rounded px-2 py-1 text-xs text-zinc-600 peer-checked:bg-zinc-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 dark:text-zinc-400 dark:peer-checked:bg-zinc-100 dark:peer-checked:text-zinc-900">
                      {actionLabels[action].label}
                    </span>
                  </label>
                ))}
              </fieldset>
              <p className="text-xs text-zinc-500">{actionLabels[rule.action].hint}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1" aria-label="Rule color">
                {RULE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color}`}
                    aria-pressed={rule.color === color}
                    className="size-5 rounded-full border-2 border-white shadow-sm ring-offset-1 aria-pressed:ring-2 aria-pressed:ring-zinc-800 dark:border-zinc-900 dark:aria-pressed:ring-zinc-100"
                    style={{ backgroundColor: color }}
                    onClick={() => void updateRule(rule.id, { color })}
                  />
                ))}
              </div>
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => void commit({ ...state, rules: state.rules.filter((item) => item.id !== rule.id) })}>
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}

        <Button variant="outline" className="w-full" onClick={() => void browser.runtime.sendMessage({ type: "CLEAR_MARKERS" } satisfies ExtensionMessage)}>
          Clear markers and show hidden posts
        </Button>
      </section>
    </main>
  );
}
