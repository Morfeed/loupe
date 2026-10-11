/* X post discovery and feed item extraction */
import { MAX_POST_LENGTH } from "../core/constants";
import type { SiteAdapter, XFeedItem } from "../core/types";

const POST_SELECTOR = "article[data-testid='tweet']";
const TEXT_SELECTOR = "[data-testid='tweetText']";
/* X renders a quoted post as a link container inside the post, with its own text and time */
const QUOTE_SELECTOR = "div[role='link']";
const STATUS_PATH = /\/status\/(\d+)/;

function normalizedText(element: Element | undefined): string {
  return element?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function isInQuote(post: HTMLElement, element: Element): boolean {
  const quote = element.closest(QUOTE_SELECTOR);
  return Boolean(quote && post.contains(quote));
}

/* The timestamp links to the post itself. Other status links can point to quoted or mentioned posts. */
function postIdFrom(post: HTMLElement): string | undefined {
  for (const time of post.querySelectorAll("time")) {
    if (isInQuote(post, time)) continue;
    const id = time.closest("a")?.getAttribute("href")?.match(STATUS_PATH)?.[1];
    if (id) return id;
  }
  return undefined;
}

/* A status page shows a conversation, and its replies are comments */
export function isSupportedXPage(location: Location | URL): boolean {
  if (location.hostname !== "x.com") return false;
  return !location.pathname.toLowerCase().split("/").includes("status");
}

export function findPostElements(root: ParentNode): HTMLElement[] {
  const found = new Set<HTMLElement>();
  if (root instanceof HTMLElement && root.matches(POST_SELECTOR)) found.add(root);
  root.querySelectorAll<HTMLElement>(POST_SELECTOR).forEach((element) => found.add(element));
  return [...found];
}

export function extractFeedItem(element: HTMLElement): XFeedItem | null {
  const postId = postIdFrom(element);
  if (!postId) return null;
  const texts = [...element.querySelectorAll(TEXT_SELECTOR)];
  const text = normalizedText(texts.find((candidate) => !isInQuote(element, candidate))).slice(0, MAX_POST_LENGTH);
  const quote = normalizedText(texts.find((candidate) => isInQuote(element, candidate)))
    .slice(0, Math.max(0, MAX_POST_LENGTH - text.length));
  if (!text && !quote) return null;

  return { site: "x", postId, text, ...(quote ? { quote } : {}) };
}

export const xAdapter: SiteAdapter<XFeedItem> = {
  site: "x",
  isSupportedPage: isSupportedXPage,
  findItemElements: findPostElements,
  closestItemElement: (node) => (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>(POST_SELECTOR) ?? null,
  extractFeedItem,
  markerPlacement: "start",
  /* A post is a plain block inside its timeline cell, so the placeholder can go before it */
  hideTarget: "item",
};
