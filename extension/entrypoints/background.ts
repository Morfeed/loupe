import { browser } from "wxt/browser";
import type { Runtime } from "wxt/browser";
import { FEED_URL_PATTERNS, HISTORY_CHANNEL, HISTORY_PRUNE_INTERVAL_MS, MAX_HISTORY_RECORDS } from "../src/core/constants";
import { loadState, hasReadyProvider } from "../src/core/storage";
import type { ContentState, ExtensionMessage, ExtensionResponse, FeedItem, MatchResult, Rule, StoredState, TabStatus } from "../src/core/types";
import { pruneRecords, saveRecords } from "../src/history/db";
import { buildHistoryRecords } from "../src/history/record";
import { analyzePosts, testProvider } from "../src/provider";

const tabStatuses = new Map<number, TabStatus>();

function contentState(state: StoredState): ContentState {
  return {
    enabled: state.enabled,
    cloudConsent: state.cloudConsent,
    rules: state.rules,
    providerReady: hasReadyProvider(state),
  };
}

async function broadcastState(): Promise<void> {
  const state = contentState(await loadState());
  const tabs = await browser.tabs.query({ url: FEED_URL_PATTERNS });
  await Promise.all(tabs.flatMap((tab) => tab.id === undefined
    ? []
    : [browser.tabs.sendMessage(tab.id, { type: "STATE_UPDATED", state } satisfies ExtensionMessage).catch(() => undefined)]));
}

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

export default defineBackground(() => {
  const localStorage = browser.storage.local as typeof browser.storage.local & {
    setAccessLevel?: (options: { accessLevel: "TRUSTED_CONTEXTS" }) => Promise<void>;
  };
  void localStorage.setAccessLevel?.({ accessLevel: "TRUSTED_CONTEXTS" });
  browser.tabs.onRemoved.addListener((tabId) => tabStatuses.delete(tabId));

  const historyChannel = new BroadcastChannel(HISTORY_CHANNEL);
  let lastPrune = 0;

  async function pruneHistory(retentionDays: number): Promise<void> {
    const now = Date.now();
    if (now - lastPrune < HISTORY_PRUNE_INTERVAL_MS) return;
    lastPrune = now;
    await pruneRecords(retentionDays, MAX_HISTORY_RECORDS, now);
  }

  /* History is optional, so a failed write must not fail the analysis or its markers */
  async function recordHistory(state: StoredState, items: FeedItem[], results: MatchResult[], rules: Rule[]): Promise<void> {
    try {
      await saveRecords(buildHistoryRecords(items, results, rules, state.provider.kind, Date.now()));
      await pruneHistory(state.history.retentionDays);
      historyChannel.postMessage({ type: "history-updated" });
    } catch {
      return;
    }
  }

  /* Pruning on wake also expires records while history recording is off */
  void loadState().then((state) => pruneHistory(state.history.retentionDays)).catch(() => undefined);
  browser.storage.onChanged.addListener(() => void broadcastState());

  browser.runtime.onMessage.addListener(async (rawMessage: unknown, sender: Runtime.MessageSender): Promise<ExtensionResponse> => {
    const message = rawMessage as ExtensionMessage;
    if (message.type === "TEST_PROVIDER") {
      try {
        await testProvider(message.provider);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Could not connect to the provider." };
      }
    }

    if (message.type === "GET_CONTENT_STATE") {
      return { ok: true, contentState: contentState(await loadState()) };
    }

    if (message.type === "GET_TAB_STATUS") {
      const state = await loadState();
      const tabId = await activeTabId();
      const fallback: TabStatus = !hasReadyProvider(state)
        ? { status: "setup-required" }
        : !state.enabled
          ? { status: "paused" }
          : { status: "ready" };
      return { ok: true, status: tabId === undefined ? fallback : (tabStatuses.get(tabId) ?? fallback) };
    }

    if (message.type === "CLEAR_MARKERS") {
      const tabId = await activeTabId();
      if (tabId !== undefined) {
        await browser.tabs.sendMessage(tabId, message).catch(() => undefined);
      }
      return { ok: true };
    }

    if (message.type !== "ANALYZE_POSTS") return { ok: false, error: "Unsupported message." };
    const tabId = sender.tab?.id;
    try {
      const state = await loadState();
      if (!state.enabled) return { ok: false, error: "Loupe is paused." };
      if (!state.cloudConsent || !hasReadyProvider(state)) return { ok: false, error: "Provider setup is required." };
      if (tabId !== undefined) tabStatuses.set(tabId, { status: "analyzing" });
      const results = await analyzePosts(state.provider, message.items, message.rules);
      if (tabId !== undefined) tabStatuses.set(tabId, { status: "ready" });
      if (state.history.enabled) void recordHistory(state, message.items, results, message.rules);
      return { ok: true, results };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Analysis failed.";
      if (tabId !== undefined) tabStatuses.set(tabId, { status: "error", message: detail });
      return { ok: false, error: detail };
    }
  });
});
