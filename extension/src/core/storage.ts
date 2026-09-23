import { browser } from "wxt/browser";
import { DEFAULT_STATE, STORAGE_KEY } from "./constants";
import { sanitizeRules } from "./rules";
import type { ProviderSettings, StoredState } from "./types";

interface PersistedProvider {
  kind?: string;
  apiKey?: string;
  verified?: boolean;
}

type PersistedState = Omit<Partial<StoredState>, "provider"> & {
  provider?: PersistedProvider;
};

function loadProvider(provider: PersistedProvider | undefined): ProviderSettings {
  if (provider?.kind !== "groq") return structuredClone(DEFAULT_STATE.provider);
  return {
    kind: "groq",
    apiKey: provider.apiKey ?? "",
    verified: provider.verified ?? false,
  };
}

export async function loadState(): Promise<StoredState> {
  const stored = (await browser.storage.local.get(STORAGE_KEY))[STORAGE_KEY] as PersistedState | undefined;
  if (!stored) return structuredClone(DEFAULT_STATE);
  const isGroqState = stored.provider?.kind === "groq";

  return {
    enabled: stored.enabled ?? DEFAULT_STATE.enabled,
    cloudConsent: isGroqState ? (stored.cloudConsent ?? DEFAULT_STATE.cloudConsent) : false,
    rules: sanitizeRules(stored.rules),
    provider: loadProvider(stored.provider),
  };
}

export async function saveState(state: StoredState): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: state });
}

export function hasReadyProvider(state: StoredState): boolean {
  return state.provider.kind === "groq" && Boolean(state.provider.apiKey && state.provider.verified);
}
