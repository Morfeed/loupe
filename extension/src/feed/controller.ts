/* Feed observation, analysis scheduling, and marker rendering for one site adapter */
import { browser } from "wxt/browser";
import { feedItemFingerprint } from "../core/batch";
import { MAX_BATCH_SIZE, MAX_CONCURRENCY } from "../core/constants";
import { analysisFingerprint } from "../core/rules";
import type { ContentState, ExtensionMessage, ExtensionResponse, FeedItem, MatchResult, Rule, SiteAdapter } from "../core/types";
import { clearMarker, renderMarker } from "./marker";

interface QueuedItem<T extends FeedItem> {
  item: T;
  element: HTMLElement;
}

function dismissKey(postId: string, ruleId: string): string {
  return `${postId}\u0000${ruleId}`;
}

export class FeedController<T extends FeedItem> {
  private readonly adapter: SiteAdapter<T>;
  private state: ContentState | null = null;
  private rulesFingerprint = "";
  private mutationObserver: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private queue: QueuedItem<T>[] = [];
  private queuedIds = new Set<string>();
  private nearby = new Set<HTMLElement>();
  private known = new Set<HTMLElement>();
  /* Sites such as YouTube reuse one element for a different item, so track the item of each element and marker */
  private seenIds = new WeakMap<HTMLElement, string | undefined>();
  private markedIds = new WeakMap<HTMLElement, string>();
  private processed = new Map<string, string>();
  private results = new Map<string, MatchResult[]>();
  private dismissed = new Set<string>();
  private revealed = new Set<string>();
  private active = 0;
  private flushTimer: number | undefined;

  constructor(adapter: SiteAdapter<T>) {
    this.adapter = adapter;
  }

  async start(): Promise<void> {
    const response = await browser.runtime.sendMessage({ type: "GET_CONTENT_STATE" } satisfies ExtensionMessage) as ExtensionResponse;
    if (!response.ok || !response.contentState) return;
    this.state = response.contentState;
    this.rulesFingerprint = analysisFingerprint(this.state.rules);
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          this.nearby.add(element);
          this.enqueue(element);
        } else {
          this.nearby.delete(element);
        }
      }
    }, { rootMargin: "600px 0px" });
    this.observeItems(document);
    this.mutationObserver = new MutationObserver((mutations) => {
      if (!this.adapter.isSupportedPage(window.location)) {
        this.clearAll();
        return;
      }
      const changed = new Set<HTMLElement>();
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) this.observeItems(node);
        });
        const element = this.adapter.closestItemElement(mutation.target);
        if (element && this.known.has(element)) changed.add(element);
      }
      changed.forEach((element) => this.revalidate(element));
    });
    this.mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    browser.runtime.onMessage.addListener(this.onMessage);
  }

  stop(): void {
    this.mutationObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    browser.runtime.onMessage.removeListener(this.onMessage);
  }

  private observeItems(root: ParentNode): void {
    for (const element of this.adapter.findItemElements(root)) {
      if (this.known.has(element)) continue;
      this.known.add(element);
      this.intersectionObserver?.observe(element);
    }
  }

  /* Hover previews mutate tiles often, so act only when the element shows a different item */
  private revalidate(element: HTMLElement): void {
    const postId = this.adapter.extractFeedItem(element)?.postId;
    if (postId === this.seenIds.get(element)) return;
    this.seenIds.set(element, postId);
    const markedId = this.markedIds.get(element);
    if (markedId !== undefined && markedId !== postId) {
      clearMarker(element);
      this.markedIds.delete(element);
    }
    if (this.nearby.has(element)) this.enqueue(element);
  }

  private enqueue(element: HTMLElement): void {
    if (!this.adapter.isSupportedPage(window.location)) return;
    if (!this.state?.enabled || !this.state.cloudConsent || !this.state.providerReady) return;
    const activeRules = this.state.rules.filter((rule) => rule.enabled && rule.criterion);
    if (!activeRules.length) return;
    const item = this.adapter.extractFeedItem(element);
    if (!item) return;
    this.seenIds.set(element, item.postId);
    if (this.queuedIds.has(item.postId)) return;
    const fingerprint = `${feedItemFingerprint(item)}:${this.rulesFingerprint}`;
    if (this.processed.get(item.postId) === fingerprint) {
      if (this.markedIds.get(element) !== item.postId) this.render(element, item.postId, this.results.get(item.postId) ?? [], this.state.rules);
      return;
    }
    this.queue.push({ item, element });
    this.queuedIds.add(item.postId);
    window.clearTimeout(this.flushTimer);
    this.flushTimer = window.setTimeout(() => this.drain(), 100);
  }

  private drain(): void {
    while (this.active < MAX_CONCURRENCY && this.queue.length) {
      const batch = this.queue.splice(0, MAX_BATCH_SIZE);
      batch.forEach(({ item }) => this.queuedIds.delete(item.postId));
      this.active += 1;
      void this.processBatch(batch).finally(() => {
        this.active -= 1;
        this.drain();
      });
    }
  }

  private async processBatch(batch: QueuedItem<T>[]): Promise<void> {
    if (!this.state || !this.adapter.isSupportedPage(window.location)) return;
    const rules = this.state.rules.filter((rule) => rule.enabled && rule.criterion);
    const requestFingerprint = analysisFingerprint(rules);
    if (!rules.length) return;
    const items = await Promise.all(batch.map(({ item }) => this.adapter.enrichFeedItem?.(item) ?? item));
    const response = await browser.runtime.sendMessage({
      type: "ANALYZE_POSTS",
      items,
      rules,
    } satisfies ExtensionMessage) as ExtensionResponse;
    if (!response.ok || !response.results || requestFingerprint !== this.rulesFingerprint || !this.adapter.isSupportedPage(window.location)) return;

    for (const { item, element } of batch) {
      const postResults = response.results.filter((result) => result.postId === item.postId);
      this.processed.set(item.postId, `${feedItemFingerprint(item)}:${requestFingerprint}`);
      this.results.set(item.postId, postResults);
      if (this.adapter.extractFeedItem(element)?.postId === item.postId) this.render(element, item.postId, postResults, this.state.rules);
    }
  }

  private render(element: HTMLElement, postId: string, results: MatchResult[], rules: Rule[]): void {
    const visibleResults = results.filter((result) => !this.dismissed.has(dismissKey(postId, result.ruleId)));
    this.markedIds.set(element, postId);
    renderMarker(element, visibleResults, rules, {
      placement: this.adapter.markerPlacement,
      hideTarget: this.adapter.hideTarget,
      revealed: this.revealed.has(postId),
      onDismiss: (ruleId) => {
        this.dismissed.add(dismissKey(postId, ruleId));
        this.render(element, postId, results, rules);
      },
      onShow: () => {
        this.revealed.add(postId);
        this.render(element, postId, results, rules);
      },
    });
  }

  private clearAll(): void {
    this.known.forEach(clearMarker);
    this.markedIds = new WeakMap();
    this.results.clear();
    this.processed.clear();
    this.dismissed.clear();
    this.revealed.clear();
  }

  /* Dismiss instead of forgetting results. A restored post enters the viewport again and is otherwise reanalyzed and hidden again. */
  private dismissAll(): void {
    for (const [postId, results] of this.results) {
      results.forEach((result) => this.dismissed.add(dismissKey(postId, result.ruleId)));
    }
    this.known.forEach(clearMarker);
    this.markedIds = new WeakMap();
  }

  private applyState(state: ContentState): void {
    const previousFingerprint = this.rulesFingerprint;
    this.state = state;
    this.rulesFingerprint = analysisFingerprint(this.state.rules);

    if (previousFingerprint !== this.rulesFingerprint) {
      this.processed.clear();
      this.results.clear();
      this.queue = [];
      this.queuedIds.clear();
      this.known.forEach(clearMarker);
      this.markedIds = new WeakMap();
      this.nearby.forEach((element) => this.enqueue(element));
      return;
    }

    for (const element of this.known) {
      const item = this.adapter.extractFeedItem(element);
      if (item) this.render(element, item.postId, this.results.get(item.postId) ?? [], this.state.rules);
    }
  }

  private onMessage = (rawMessage: unknown): ExtensionResponse | void => {
    const message = rawMessage as ExtensionMessage;
    if (message.type === "STATE_UPDATED") {
      this.applyState(message.state);
      return { ok: true };
    }
    if (message.type !== "CLEAR_MARKERS") return undefined;
    this.dismissAll();
    return { ok: true };
  };
}
