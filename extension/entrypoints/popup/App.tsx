import { ArrowDown, ArrowUp, Cloud, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { MAX_RULES, PROVIDERS, RULE_COLORS } from "../../src/core/constants";
import { createRule, moveRule } from "../../src/core/rules";
import { hasReadyProvider, loadState, saveState } from "../../src/core/storage";
import type { ExtensionMessage, ExtensionResponse, Rule, StoredState, TabStatus } from "../../src/core/types";

const statusLabels: Record<TabStatus["status"], string> = {
  "setup-required": "Setup required",
  ready: "Ready",
  analyzing: "Analyzing",
  paused: "Paused",
  error: "Error",
};

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
            <h1 className="text-base font-bold">Morfeed</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
              <span className="size-2 rounded-full bg-blue-500" />
              {statusLabels[status.status]}
              <span className="flex items-center gap-1"><Cloud className="size-3" /> Cloud</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={state.enabled}
              disabled={!state.cloudConsent}
              label="Enable Morfeed"
              onCheckedChange={(enabled) => void commit({ ...state, enabled })}
            />
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
            <p>Morfeed sends visible post text, the subreddit, and your enabled rules to {providerLabel} for analysis.</p>
            <Button className="mt-3" size="sm" onClick={() => void commit({ ...state, cloudConsent: true })}>Allow cloud analysis</Button>
          </div>
        )}

        {!hasReadyProvider(state) && (
          <button className="w-full rounded-lg border border-amber-300 bg-amber-50 p-3 text-left text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100" onClick={() => void browser.runtime.openOptionsPage()}>
            Add and verify your {providerLabel} API key to start.
          </button>
        )}

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
          Clear markers on this tab
        </Button>
      </section>
    </main>
  );
}
