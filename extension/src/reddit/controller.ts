import { browser } from "wxt/browser";
import { MAX_BATCH_SIZE, MAX_CONCURRENCY } from "../core/constants";
import { analysisFingerprint } from "../core/rules";
import type { ContentState, ExtensionMessage, ExtensionResponse, FeedItem, MatchResult, Rule } from "../core/types";
import { extractFeedItem, feedItemFingerprint, findPostElements, isSupportedRedditFeed } from "./adapter";
import { clearMarker, renderMarker } from "./marker";

interface QueuedPost {
  item: FeedItem;
  element: HTMLElement;
}

export class RedditController {
  private state: ContentState | null = null;
  private rulesFingerprint = "";
  private mutationObserver: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private queue: QueuedPost[] = [];
  private queuedIds = new Set<string>();
  private nearby = new Set<HTMLElement>();
  private known = new Set<HTMLElement>();
  private processed = new Map<string, string>();
  private results = new Map<string, MatchResult[]>();
  private dismissed = new Set<string>();
  private active = 0;
  private flushTimer: number | undefined;

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
    this.observePosts(document);
    this.mutationObserver = new MutationObserver((mutations) => {
      if (!isSupportedRedditFeed(window.location)) {
        this.clearAll();
        return;
      }
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) this.observePosts(node);
        });
      }
    });
    this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    browser.runtime.onMessage.addListener(this.onMessage);
  }

  stop(): void {
    this.mutationObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    browser.runtime.onMessage.removeListener(this.onMessage);
  }

  private observePosts(root: ParentNode): void {
    for (const element of findPostElements(root)) {
      if (this.known.has(element)) continue;
      this.known.add(element);
      this.intersectionObserver?.observe(element);
    }
  }

  private enqueue(element: HTMLElement): void {
    if (!isSupportedRedditFeed(window.location)) return;
    if (!this.state?.enabled || !this.state.cloudConsent || !this.state.providerReady) return;
    const activeRules = this.state.rules.filter((rule) => rule.enabled && rule.criterion);
    if (!activeRules.length) return;
    const item = extractFeedItem(element);
    if (!item || this.queuedIds.has(item.postId)) return;
    const fingerprint = `${feedItemFingerprint(item)}:${this.rulesFingerprint}`;
    if (this.processed.get(item.postId) === fingerprint) return;
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

  private async processBatch(batch: QueuedPost[]): Promise<void> {
    if (!this.state || !isSupportedRedditFeed(window.location)) return;
    const rules = this.state.rules.filter((rule) => rule.enabled && rule.criterion);
    const requestFingerprint = analysisFingerprint(rules);
    if (!rules.length) return;
    const response = await browser.runtime.sendMessage({
      type: "ANALYZE_POSTS",
      items: batch.map(({ item }) => item),
      rules,
    } satisfies ExtensionMessage) as ExtensionResponse;
    if (!response.ok || !response.results || requestFingerprint !== this.rulesFingerprint || !isSupportedRedditFeed(window.location)) return;

    for (const { item, element } of batch) {
      const postResults = response.results.filter((result) => result.postId === item.postId);
      this.processed.set(item.postId, `${feedItemFingerprint(item)}:${requestFingerprint}`);
      this.results.set(item.postId, postResults);
      this.render(element, item.postId, postResults, this.state.rules);
    }
  }

  private render(element: HTMLElement, postId: string, results: MatchResult[], rules: Rule[]): void {
    const visibleResults = results.filter((result) => !this.dismissed.has(`${postId}\u0000${result.ruleId}`));
    renderMarker(element, visibleResults, rules, (ruleId) => {
      this.dismissed.add(`${postId}\u0000${ruleId}`);
      this.render(element, postId, results, rules);
    });
  }

  private clearAll(): void {
    this.known.forEach(clearMarker);
    this.results.clear();
    this.processed.clear();
    this.dismissed.clear();
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
      this.nearby.forEach((element) => this.enqueue(element));
      return;
    }

    for (const element of this.known) {
      const item = extractFeedItem(element);
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
    this.clearAll();
    return { ok: true };
  };
}
