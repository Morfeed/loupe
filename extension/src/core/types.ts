export type RuleColor =
  | "#ef4444"
  | "#f97316"
  | "#eab308"
  | "#22c55e"
  | "#06b6d4"
  | "#3b82f6"
  | "#8b5cf6"
  | "#ec4899";

export interface Rule {
  id: string;
  name: string;
  criterion: string;
  enabled: boolean;
  color: RuleColor;
}

export type ProviderKind = "groq" | "typesafe";

export interface ProviderInfo {
  label: string;
  model: string;
  keyUrl: string;
  keyPlaceholder: string;
  note: string;
}

export interface ProviderSettings {
  kind: ProviderKind;
  apiKey: string;
  verified: boolean;
}

export interface StoredState {
  enabled: boolean;
  cloudConsent: boolean;
  rules: Rule[];
  provider: ProviderSettings;
}

export interface ContentState {
  enabled: boolean;
  cloudConsent: boolean;
  rules: Rule[];
  providerReady: boolean;
}

export interface FeedItem {
  postId: string;
  title: string;
  body: string;
  subreddit: string;
}

export interface MatchResult {
  postId: string;
  ruleId: string;
  matched: boolean;
  reason?: string;
}

export type RuntimeStatus = "setup-required" | "ready" | "analyzing" | "paused" | "error";

export interface TabStatus {
  status: RuntimeStatus;
  message?: string;
}

export type ExtensionMessage =
  | { type: "ANALYZE_POSTS"; items: FeedItem[]; rules: Rule[] }
  | { type: "GET_CONTENT_STATE" }
  | { type: "STATE_UPDATED"; state: ContentState }
  | { type: "GET_TAB_STATUS" }
  | { type: "CLEAR_MARKERS" }
  | { type: "TEST_PROVIDER"; provider: ProviderSettings };

export type ExtensionResponse =
  | { ok: true; results?: MatchResult[]; status?: TabStatus; contentState?: ContentState }
  | { ok: false; error: string };
