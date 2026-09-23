import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { browser } from "wxt/browser";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { MODEL_ID } from "../../src/core/constants";
import { loadState, saveState } from "../../src/core/storage";
import type { ExtensionMessage, ExtensionResponse, ProviderSettings, StoredState } from "../../src/core/types";

export function App() {
  const [state, setState] = useState<StoredState | null>(null);
  const [provider, setProvider] = useState<ProviderSettings>({ kind: "groq", apiKey: "", verified: false });
  const [phase, setPhase] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadState().then((loaded) => {
      setState(loaded);
      setProvider(loaded.provider);
    });
  }, []);

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
    const next = { ...state, provider: verified };
    await saveState(next);
    setState(next);
    setProvider(verified);
    setPhase("success");
    setMessage("Connection verified and credentials saved locally.");
  }

  return (
    <main className="mx-auto max-w-2xl p-6 sm:p-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">Morfeed</p>
        <h1 className="mt-1 text-2xl font-bold">Groq settings</h1>
        <p className="mt-2 text-sm text-zinc-500">Credentials are stored in Chrome’s local extension storage and used only by Morfeed’s background worker.</p>
      </div>

      <form className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950" onSubmit={(event) => void submit(event)}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="api-key">Groq API key</label>
          <Input id="api-key" required type="password" autoComplete="off" value={provider.apiKey} onChange={(event) => { setProvider({ ...provider, apiKey: event.target.value, verified: false }); setPhase("idle"); }} placeholder="gsk_…" />
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          <p><strong>Model:</strong> {MODEL_ID}</p>
          <p className="mt-1"><strong>Provider:</strong> GroqCloud</p>
          <p className="mt-1">Groq’s free-tier limits can change. Morfeed does not enable paid billing on your account.</p>
        </div>
        {message && <p role="status" className={phase === "error" ? "text-sm text-red-600" : "text-sm text-green-600"}>{message}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={phase === "testing"}>{phase === "testing" ? "Testing…" : "Save & test"}</Button>
          <a className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline" href="https://console.groq.com/keys" target="_blank" rel="noreferrer">Get a Groq API key <ExternalLink className="size-3.5" /></a>
        </div>
      </form>
    </main>
  );
}
