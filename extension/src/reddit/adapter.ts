import { MAX_POST_LENGTH } from "../core/constants";
import { contentFingerprint } from "../core/batch";
import type { RedditFeedItem, SiteAdapter } from "../core/types";

const POST_SELECTOR = "shreddit-post, article[data-testid='post-container'], div[data-testid='post-container']";

function textFrom(element: Element, selectors: string[]): string {
  for (const selector of selectors) {
    const value = element.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim();
    if (value) return value;
  }
  return "";
}

function attributeFrom(element: Element, names: string[]): string {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }
  return "";
}

export function isSupportedRedditFeed(location: Location | URL): boolean {
  if (location.hostname !== "www.reddit.com") return false;
  const segments = location.pathname.toLowerCase().split("/").filter(Boolean);
  return !segments.includes("comments") && !segments.includes("search") && !segments.includes("submit");
}

export function findPostElements(root: ParentNode): HTMLElement[] {
  const found = new Set<HTMLElement>();
  if (root instanceof HTMLElement && root.matches(POST_SELECTOR)) found.add(root);
  root.querySelectorAll<HTMLElement>(POST_SELECTOR).forEach((element) => found.add(element));
  return [...found];
}

export function extractFeedItem(element: HTMLElement): RedditFeedItem | null {
  const title = (
    attributeFrom(element, ["post-title", "data-title"]) ||
    textFrom(element, ["[slot='title']", "[data-testid='post-title']", "h1", "h2", "h3"])
  ).slice(0, MAX_POST_LENGTH);
  const body = textFrom(element, [
    "[slot='text-body']",
    "[data-post-click-location='text-body']",
    "[data-testid='post-content']",
    "div[id$='-post-rtjson-content']",
  ]).slice(0, Math.max(0, MAX_POST_LENGTH - title.length));
  if (!title && !body) return null;

  const subredditRaw =
    attributeFrom(element, ["subreddit-prefixed-name", "data-subreddit-prefixed-name", "data-subreddit"]) ||
    textFrom(element, ["[data-testid='subreddit-name']", "a[href^='/r/']"]);
  const subreddit = subredditRaw.replace(/^r\//i, "").slice(0, 80);
  const href =
    attributeFrom(element, ["permalink", "content-href"]) ||
    element.querySelector<HTMLAnchorElement>("a[href*='/comments/']")?.getAttribute("href") ||
    "";
  const redditId = href.match(/\/comments\/([^/]+)/i)?.[1];
  const postId =
    attributeFrom(element, ["post-id", "data-post-id", "id"]) ||
    redditId ||
    `local-${contentFingerprint(`${subreddit}\n${title}\n${body}`)}`;

  return { site: "reddit", postId, subreddit, title, body };
}

export const redditAdapter: SiteAdapter<RedditFeedItem> = {
  site: "reddit",
  isSupportedPage: isSupportedRedditFeed,
  findItemElements: findPostElements,
  closestItemElement: (node) => (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>(POST_SELECTOR) ?? null,
  extractFeedItem,
  markerPlacement: "start",
  /* shreddit-post draws its action bar in shadow DOM, so only hiding the host hides the whole post */
  hideTarget: "item",
};
