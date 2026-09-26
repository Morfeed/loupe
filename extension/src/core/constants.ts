import type { ProviderInfo, ProviderKind, RuleColor, StoredState } from "./types";

export const STORAGE_KEY = "morfeed-state";

export const PROVIDERS: Record<ProviderKind, ProviderInfo> = {
  groq: {
    label: "GroqCloud",
    model: "openai/gpt-oss-20b",
    keyUrl: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_…",
    note: "Groq’s free-tier limits can change. Morfeed does not enable paid billing on your account.",
  },
  typesafe: {
    label: "TypeSafe",
    model: "jev-latest",
    keyUrl: "https://console.typesafe.ai/keys",
    keyPlaceholder: "TypeSafe API key",
    note: "TypeSafe bills your account for input tokens. Jev returns a match probability, so markers show no reason.",
  },
};

export const PROVIDER_KINDS = Object.keys(PROVIDERS) as ProviderKind[];

export const MAX_RULES = 8;
export const MAX_POST_LENGTH = 4_000;
export const MAX_BATCH_SIZE = 5;
export const MAX_CONCURRENCY = 2;

export const RULE_COLORS: RuleColor[] = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export const DEFAULT_STATE: StoredState = {
  enabled: true,
  cloudConsent: false,
  rules: [],
  provider: {
    kind: "groq",
    apiKey: "",
    verified: false,
  },
};
