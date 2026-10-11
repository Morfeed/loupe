export type RuleColor =
  | "#ef4444"
  | "#f97316"
  | "#eab308"
  | "#22c55e"
  | "#06b6d4"
  | "#3b82f6"
  | "#8b5cf6"
  | "#ec4899";

export type RuleAction = "mark" | "hide" | "remove";

export interface Rule {
  id: string;
  name: string;
  criterion: string;
  enabled: boolean;
  color: RuleColor;
  action: RuleAction;
}

export type ProviderKind = "groq" | "typesafe";

export type SiteId = FeedItem["site"];

export interface SiteInfo {
  label: string;
  /* What the cloud consent text says Loupe sends for this site */
  sends: string;
}

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

export interface HistorySettings {
  enabled: boolean;
  retentionDays: number;
}

export interface StoredState {
  enabled: boolean;
  cloudConsent: boolean;
  sites: Record<SiteId, boolean>;
  rules: Rule[];
  provider: ProviderSettings;
  history: HistorySettings;
}

export interface ContentState {
  enabled: boolean;
  cloudConsent: boolean;
  sites: Record<SiteId, boolean>;
  rules: Rule[];
  providerReady: boolean;
}

export interface RedditFeedItem {
  site: "reddit";
  postId: string;
  subreddit: string;
  title: string;
  body: string;
}

export interface YouTubeFeedItem {
  site: "youtube";
  postId: string;
  channel: string;
  title: string;
  description?: string;
  keywords?: string[];
  category?: string;
  durationSeconds?: number;
  publishDate?: string;
  isLiveStream?: boolean;
  isShort?: boolean;
}

export interface XFeedItem {
  site: "x";
  postId: string;
  text: string;
  /* A quote post often means nothing without the post that it quotes */
  quote?: string;
}

export type FeedItem = RedditFeedItem | YouTubeFeedItem | XFeedItem;

export interface SiteAdapter<T extends FeedItem = FeedItem> {
  site: T["site"];
  isSupportedPage(location: Location | URL): boolean;
  findItemElements(root: ParentNode): HTMLElement[];
  closestItemElement(node: Node): HTMLElement | null;
  extractFeedItem(element: HTMLElement): T | null;
  /* Must resolve to the original item on any failure so analysis fails open */
  enrichFeedItem?(item: T): Promise<T>;
  markerPlacement: "start" | "end";
  /* "item" hides the element and puts the placeholder before it. "contents" keeps the element box and hides its children. */
  hideTarget: "item" | "contents";
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
