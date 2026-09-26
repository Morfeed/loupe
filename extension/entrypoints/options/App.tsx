import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { browser } from "wxt/browser";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { DEFAULT_STATE, PROVIDER_KINDS, PROVIDERS } from "../../src/core/constants";
import { isProviderKind, loadState, saveState } from "../../src/core/storage";
import type { ExtensionMessage, ExtensionResponse, ProviderSettings, StoredState } from "../../src/core/types";

export function App() {
  const [state, setState] = useState<StoredState | null>(null);
  const [provider, setProvider] = useState<ProviderSettings>(DEFAULT_STATE.provider);
  const [phase, setPhase] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const info = PROVIDERS[provider.kind];

  useEffect(() => {
    void loadState().then((loaded) => {
      setState(loaded);
      setProvider(loaded.provider);
    });
  }, []);

  function selectProvider(kind: string) {
    if (!state || !isProviderKind(kind)) return;
    /* Restore the saved key when the user switches back to the saved provider */
    setProvider(kind === state.provider.kind ? state.provider : { kind, apiKey: "", verified: false });
    setPhase("idle");
    setMessage("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!state) return;
    setPhase("testing");
    setMessage("");
    const candidate = { ...provider, apiKey: provider.apiKey.trim(), verified: false };
    const response = await browser.runtime.sendMessage({ type: "TEST_PROVIDER", provider: candidate } satisfies ExtensionMessage) as ExtensionResponse;
    if (!response.ok) {
      setPhase("error");
      setMessage(response.error);
      return;
    }
    const verified = { ...candidate, verified: true };
    /* Consent names one recipient, so a new provider needs new consent */
    const providerChanged = verified.kind !== state.provider.kind;
    const next = { ...state, provider: verified, cloudConsent: providerChanged ? false : state.cloudConsent };
    await saveState(next);
    setState(next);
    setProvider(verified);
    setPhase("success");
    setMessage(providerChanged
      ? `Connection verified and credentials saved locally. Allow ${info.label} analysis in the popup to start.`
      : "Connection verified and credentials saved locally.");
  }

  return (
    <main className="mx-auto max-w-2xl p-6 sm:p-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">Morfeed</p>
        <h1 className="mt-1 text-2xl font-bold">Model settings</h1>
        <p className="mt-2 text-sm text-zinc-500">Credentials are stored in Chrome’s local extension storage and used only by Morfeed’s background worker.</p>
      </div>

      <form className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950" onSubmit={(event) => void submit(event)}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="provider">Model</label>
          <select
            id="provider"
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={provider.kind}
            onChange={(event) => selectProvider(event.target.value)}
          >
            {PROVIDER_KINDS.map((kind) => (
              <option key={kind} value={kind}>{PROVIDERS[kind].model} ({PROVIDERS[kind].label})</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="api-key">{info.label} API key</label>
          <Input id="api-key" required type="password" autoComplete="off" value={provider.apiKey} onChange={(event) => { setProvider({ ...provider, apiKey: event.target.value, verified: false }); setPhase("idle"); }} placeholder={info.keyPlaceholder} />
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          <p><strong>Model:</strong> {info.model}</p>
          <p className="mt-1"><strong>Provider:</strong> {info.label}</p>
          <p className="mt-1">{info.note}</p>
        </div>
        {message && <p role="status" className={phase === "error" ? "text-sm text-red-600" : "text-sm text-green-600"}>{message}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={phase === "testing"}>{phase === "testing" ? "Testing…" : "Save & test"}</Button>
          <a className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline" href={info.keyUrl} target="_blank" rel="noreferrer">Get a {info.label} API key <ExternalLink className="size-3.5" /></a>
        </div>
      </form>
    </main>
  );
}
