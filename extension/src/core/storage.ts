import { browser } from "wxt/browser";
import { DEFAULT_STATE, PROVIDER_KINDS, STORAGE_KEY } from "./constants";
import { sanitizeRules } from "./rules";
import type { ProviderKind, ProviderSettings, StoredState } from "./types";

interface PersistedProvider {
  kind?: string;
  apiKey?: string;
  verified?: boolean;
}

type PersistedState = Omit<Partial<StoredState>, "provider"> & {
  provider?: PersistedProvider;
};

export function isProviderKind(kind: unknown): kind is ProviderKind {
  return PROVIDER_KINDS.includes(kind as ProviderKind);
}

function loadProvider(provider: PersistedProvider | undefined): ProviderSettings {
  if (!isProviderKind(provider?.kind)) return structuredClone(DEFAULT_STATE.provider);
  return {
    kind: provider.kind,
    apiKey: provider.apiKey ?? "",
    verified: provider.verified ?? false,
  };
}

export async function loadState(): Promise<StoredState> {
  const stored = (await browser.storage.local.get(STORAGE_KEY))[STORAGE_KEY] as PersistedState | undefined;
  if (!stored) return structuredClone(DEFAULT_STATE);

  return {
    enabled: stored.enabled ?? DEFAULT_STATE.enabled,
    cloudConsent: isProviderKind(stored.provider?.kind) ? (stored.cloudConsent ?? DEFAULT_STATE.cloudConsent) : false,
    rules: sanitizeRules(stored.rules),
    provider: loadProvider(stored.provider),
  };
}

export async function saveState(state: StoredState): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: state });
}

export function hasReadyProvider(state: StoredState): boolean {
  return isProviderKind(state.provider.kind) && Boolean(state.provider.apiKey && state.provider.verified);
}
