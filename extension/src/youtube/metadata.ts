/* Public video details from the InnerTube player endpoint that youtube.com itself calls */
import { MAX_DESCRIPTION_LENGTH, MAX_KEYWORDS } from "../core/constants";
import type { YouTubeFeedItem } from "../core/types";

export type VideoDetails = Pick<
  YouTubeFeedItem,
  "channel" | "description" | "keywords" | "category" | "durationSeconds" | "publishDate" | "isLiveStream"
>;

interface PlayerResponse {
  videoDetails?: {
    videoId?: unknown;
    author?: unknown;
    shortDescription?: unknown;
    keywords?: unknown;
    lengthSeconds?: unknown;
    isLiveContent?: unknown;
  };
  microformat?: { playerMicroformatRenderer?: { category?: unknown; publishDate?: unknown } };
}

const PLAYER_ENDPOINT = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
/* InnerTube rejects very old client versions. Use this value only when the page does not expose its own version. */
const FALLBACK_CLIENT_VERSION = "2.20261002.01.00";
const REQUEST_TIMEOUT_MS = 5_000;
const MAX_CACHED_VIDEOS = 500;

const cache = new Map<string, Promise<VideoDetails | null>>();
let clientVersion: string | undefined;

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.replace(/\s+/g, " ").trim() : undefined;
}

export function parsePlayerResponse(payload: unknown, videoId: string): VideoDetails | null {
  const { videoDetails, microformat } = (payload ?? {}) as PlayerResponse;
  if (!videoDetails || videoDetails.videoId !== videoId) return null;

  const duration = Number(videoDetails.lengthSeconds);
  const keywords = Array.isArray(videoDetails.keywords)
    ? videoDetails.keywords.flatMap((keyword) => text(keyword)?.slice(0, 50) ?? []).slice(0, MAX_KEYWORDS)
    : [];
  const publishDate = text(microformat?.playerMicroformatRenderer?.publishDate)?.slice(0, 10);

  return {
    channel: text(videoDetails.author)?.slice(0, 80) ?? "",
    description: text(videoDetails.shortDescription)?.slice(0, MAX_DESCRIPTION_LENGTH),
    keywords: keywords.length ? keywords : undefined,
    category: text(microformat?.playerMicroformatRenderer?.category)?.slice(0, 80),
    durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : undefined,
    publishDate: publishDate && /^\d{4}-\d{2}-\d{2}$/.test(publishDate) ? publishDate : undefined,
    isLiveStream: videoDetails.isLiveContent === true || undefined,
  };
}

/* Content scripts cannot read the page's ytcfg global, but the initial HTML embeds the same value */
function innertubeClientVersion(): string {
  clientVersion ??= [...document.scripts]
    .map((script) => script.textContent?.match(/"INNERTUBE_CLIENT_VERSION":"([\d.]+)"/)?.[1])
    .find(Boolean) ?? FALLBACK_CLIENT_VERSION;
  return clientVersion;
}

async function requestVideoDetails(videoId: string): Promise<VideoDetails | null> {
  const response = await fetch(PLAYER_ENDPOINT, {
    method: "POST",
    /* Omit cookies so the lookup is not tied to the signed-in account */
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      context: { client: { clientName: "WEB", clientVersion: innertubeClientVersion(), hl: "en" } },
      videoId,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) return null;
  return parsePlayerResponse(await response.json(), videoId);
}

export function fetchVideoDetails(videoId: string): Promise<VideoDetails | null> {
  const cached = cache.get(videoId);
  if (cached) return cached;

  const pending = requestVideoDetails(videoId).catch(() => null).then((details) => {
    /* Forget failures so a later analysis of the same video can try again */
    if (!details) cache.delete(videoId);
    return details;
  });
  if (cache.size >= MAX_CACHED_VIDEOS) cache.delete(cache.keys().next().value!);
  cache.set(videoId, pending);
  return pending;
}
