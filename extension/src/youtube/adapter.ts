/* YouTube video tile discovery and feed item extraction */
import type { SiteAdapter, YouTubeFeedItem } from "../core/types";
import { fetchVideoDetails } from "./metadata";

/* New lockups nest inside older renderers on some surfaces, so only the outermost tile counts */
const TILE_SELECTOR = [
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-playlist-video-renderer",
  "yt-lockup-view-model",
  "ytm-shorts-lockup-view-model",
  "ytm-shorts-lockup-view-model-v2",
].join(", ");
const VIDEO_LINK_SELECTOR = "a[href*='/watch?v='], a[href^='/shorts/']";
const COLLECTION_SELECTOR = "yt-collection-thumbnail-view-model, ytd-playlist-thumbnail";
const VIDEO_ID = /^[\w-]{11}$/;

function textFrom(element: Element, selectors: string[]): string {
  for (const selector of selectors) {
    for (const match of element.querySelectorAll(selector)) {
      const value = match.textContent?.replace(/\s+/g, " ").trim();
      if (value) return value;
    }
  }
  return "";
}

function outermostTile(element: HTMLElement | null): HTMLElement | null {
  let tile = element;
  while (tile) {
    const outer = tile.parentElement?.closest<HTMLElement>(TILE_SELECTOR);
    if (!outer) return tile;
    tile = outer;
  }
  return null;
}

export function videoFromHref(href: string): { videoId: string; isShort: boolean } | null {
  const url = new URL(href, "https://www.youtube.com");
  const shortId = url.pathname.match(/^\/shorts\/([^/]+)/)?.[1];
  const videoId = shortId ?? (url.pathname === "/watch" ? url.searchParams.get("v") : null);
  return videoId && VIDEO_ID.test(videoId) ? { videoId, isShort: Boolean(shortId) } : null;
}

export function isSupportedYouTubePage(location: Location | URL): boolean {
  return location.hostname === "www.youtube.com";
}

export function findVideoElements(root: ParentNode): HTMLElement[] {
  const found = new Set<HTMLElement>();
  if (root instanceof HTMLElement && root.matches(TILE_SELECTOR)) found.add(root);
  root.querySelectorAll<HTMLElement>(TILE_SELECTOR).forEach((element) => found.add(element));
  return [...found].filter((element) => outermostTile(element) === element);
}

export function extractFeedItem(element: HTMLElement): YouTubeFeedItem | null {
  if (element.querySelector(COLLECTION_SELECTOR)) return null;
  const link = element.querySelector<HTMLAnchorElement>(VIDEO_LINK_SELECTOR)?.getAttribute("href");
  const video = link ? videoFromHref(link) : null;
  if (!video) return null;

  const title = (
    element.querySelector("#video-title")?.getAttribute("title")?.trim() ||
    textFrom(element, ["#video-title", ".yt-lockup-metadata-view-model__title", "h3"])
  ).slice(0, 200);
  if (!title) return null;
  const channel = textFrom(element, ["ytd-channel-name #text", "a[href^='/@']", "a[href^='/channel/']"]).slice(0, 80);

  return {
    site: "youtube",
    postId: video.videoId,
    channel,
    title,
    ...(video.isShort ? { isShort: true } : {}),
  };
}

export async function enrichFeedItem(item: YouTubeFeedItem): Promise<YouTubeFeedItem> {
  const details = await fetchVideoDetails(item.postId);
  return details ? { ...item, ...details, channel: details.channel || item.channel } : item;
}

export const youtubeAdapter: SiteAdapter<YouTubeFeedItem> = {
  isSupportedPage: isSupportedYouTubePage,
  findItemElements: findVideoElements,
  closestItemElement: (node) => outermostTile((node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>(TILE_SELECTOR) ?? null),
  extractFeedItem,
  enrichFeedItem,
  /* A row above the thumbnail would push one grid tile out of line with its row */
  markerPlacement: "end",
  /* A placeholder outside a grid tile gets no cell width, so keep the tile and hide its contents */
  hideTarget: "contents",
};
