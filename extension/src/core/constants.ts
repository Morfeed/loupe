import type { ProviderInfo, ProviderKind, RuleAction, RuleColor, SiteId, SiteInfo, StoredState } from "./types";

export const STORAGE_KEY = "loupe-state";

export const PROVIDERS: Record<ProviderKind, ProviderInfo> = {
  groq: {
    label: "GroqCloud",
    model: "openai/gpt-oss-20b",
    keyUrl: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_…",
    note: "Groq’s free-tier limits can change. Loupe does not enable paid billing on your account.",
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

export const SITES: Record<SiteId, SiteInfo> = {
  reddit: { label: "Reddit", sends: "visible Reddit post text and subreddits" },
  youtube: { label: "YouTube", sends: "public YouTube video details such as title, channel, and description" },
  x: { label: "X", sends: "visible X post text and the posts they quote" },
};

export const SITE_IDS = Object.keys(SITES) as SiteId[];

export const FEED_URL_PATTERNS = ["https://www.reddit.com/*", "https://www.youtube.com/*", "https://x.com/*"];

export const MAX_RULES = 8;
export const MAX_POST_LENGTH = 4_000;
/* The top of a description carries the signal. The rest is mostly links and timestamps that use the token budget. */
export const MAX_DESCRIPTION_LENGTH = 1_000;
export const MAX_KEYWORDS = 20;
export const MAX_BATCH_SIZE = 5;
export const MAX_CONCURRENCY = 2;

export const HISTORY_DB_NAME = "loupe";
export const HISTORY_CHANNEL = "loupe-history";
export const HISTORY_RETENTION_DAYS = [1, 7, 30];
export const MAX_HISTORY_RECORDS = 2_000;
export const HISTORY_PRUNE_INTERVAL_MS = 60_000;

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

/* Ordered from weakest to strongest. The strongest action of all matching rules applies to a post. */
export const RULE_ACTIONS: RuleAction[] = ["mark", "hide", "remove"];

export const DEFAULT_STATE: StoredState = {
  enabled: true,
  cloudConsent: false,
  /* X is off by default because consent given before X support did not cover X posts */
  sites: {
    reddit: true,
    youtube: true,
    x: false,
  },
  rules: [],
  provider: {
    kind: "groq",
    apiKey: "",
    verified: false,
  },
  history: {
    enabled: true,
    retentionDays: 7,
  },
};
