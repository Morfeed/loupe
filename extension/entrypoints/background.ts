import { browser } from "wxt/browser";
import type { Runtime } from "wxt/browser";
import { loadState, hasReadyProvider } from "../src/core/storage";
import type { ContentState, ExtensionMessage, ExtensionResponse, StoredState, TabStatus } from "../src/core/types";
import { analyzePosts, testProvider } from "../src/provider/groq";

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
  const tabs = await browser.tabs.query({ url: "https://www.reddit.com/*" });
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
  browser.storage.onChanged.addListener(() => void broadcastState());

  browser.runtime.onMessage.addListener(async (rawMessage: unknown, sender: Runtime.MessageSender): Promise<ExtensionResponse> => {
    const message = rawMessage as ExtensionMessage;
    if (message.type === "TEST_PROVIDER") {
      try {
        await testProvider(message.provider);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Could not connect to Groq." };
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
      if (!state.enabled) return { ok: false, error: "Morfeed is paused." };
      if (!state.cloudConsent || !hasReadyProvider(state)) return { ok: false, error: "Groq setup is required." };
      if (tabId !== undefined) tabStatuses.set(tabId, { status: "analyzing" });
      const results = await analyzePosts(state.provider, message.items, message.rules);
      if (tabId !== undefined) tabStatuses.set(tabId, { status: "ready" });
      return { ok: true, results };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Analysis failed.";
      if (tabId !== undefined) tabStatuses.set(tabId, { status: "error", message: detail });
      return { ok: false, error: detail };
    }
  });
});
