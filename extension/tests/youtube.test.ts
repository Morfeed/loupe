import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixture from "./fixtures/youtube-feed.html?raw";
import { enrichFeedItem, extractFeedItem, findVideoElements, isSupportedYouTubePage, videoFromHref, youtubeAdapter } from "../src/youtube/adapter";
import { parsePlayerResponse } from "../src/youtube/metadata";

const playerResponse = {
  playabilityStatus: { status: "UNPLAYABLE" },
  videoDetails: {
    videoId: "aaaaaaaaaaa",
    author: "React Channel",
    shortDescription: "Learn   hooks\n\nand state.",
    keywords: ["react", "  tutorial ", 42],
    lengthSeconds: "612",
    isLiveContent: false,
  },
  microformat: { playerMicroformatRenderer: { category: "Education", publishDate: "2026-09-30T08:00:00-07:00" } },
};

describe("YouTube adapter", () => {
  beforeEach(() => {
    document.body.innerHTML = fixture;
  });

  it("finds only the outermost tile for each video", () => {
    const ids = findVideoElements(document).map((element) => element.id);
    expect(ids).toEqual(["lockup-tile", "classic-tile", "short-tile", "playlist-tile", "ad-tile"]);
    const nested = document.querySelector<HTMLElement>("#lockup-tile yt-lockup-view-model")!;
    expect(findVideoElements(nested)).toEqual([]);
    expect(youtubeAdapter.closestItemElement(nested.querySelector("h3")!)?.id).toBe("lockup-tile");
  });

  it("extracts video tiles and skips playlists and ads", () => {
    const item = (id: string) => extractFeedItem(document.getElementById(id)!);
    expect(item("lockup-tile")).toEqual({ site: "youtube", postId: "aaaaaaaaaaa", channel: "React Channel", title: "Build a React app in 10 minutes" });
    expect(item("classic-tile")).toEqual({ site: "youtube", postId: "bbbbbbbbbbb", channel: "Lofi Girl", title: "Lo-fi beats to study to" });
    expect(item("short-tile")).toMatchObject({ postId: "ccccccccccc", title: "Funny cat short", isShort: true });
    expect(item("playlist-tile")).toBeNull();
    expect(item("ad-tile")).toBeNull();
  });

  it("reads video IDs from watch and Shorts links only", () => {
    expect(videoFromHref("/watch?v=aaaaaaaaaaa&t=30s")).toEqual({ videoId: "aaaaaaaaaaa", isShort: false });
    expect(videoFromHref("/shorts/ccccccccccc")).toEqual({ videoId: "ccccccccccc", isShort: true });
    expect(videoFromHref("/watch?v=short")).toBeNull();
    expect(videoFromHref("/@channel")).toBeNull();
  });

  it("supports desktop YouTube only", () => {
    expect(isSupportedYouTubePage(new URL("https://www.youtube.com/feed/subscriptions"))).toBe(true);
    expect(isSupportedYouTubePage(new URL("https://m.youtube.com/"))).toBe(false);
  });
});

describe("YouTube metadata", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalizes player details", () => {
    expect(parsePlayerResponse(playerResponse, "aaaaaaaaaaa")).toEqual({
      channel: "React Channel",
      description: "Learn hooks and state.",
      keywords: ["react", "tutorial"],
      category: "Education",
      durationSeconds: 612,
      publishDate: "2026-09-30",
      isLiveStream: undefined,
    });
  });

  it("rejects a response for another video", () => {
    expect(parsePlayerResponse(playerResponse, "zzzzzzzzzzz")).toBeNull();
    expect(parsePlayerResponse(null, "aaaaaaaaaaa")).toBeNull();
  });

  it("enriches an item without cookies and keeps the visible title", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => playerResponse });
    vi.stubGlobal("fetch", fetchMock);

    const item = await enrichFeedItem({ site: "youtube", postId: "aaaaaaaaaaa", channel: "", title: "Visible title" });

    expect(item).toMatchObject({ title: "Visible title", channel: "React Channel", category: "Education", durationSeconds: 612 });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.credentials).toBe("omit");
    expect(JSON.parse(request.body as string)).toMatchObject({ videoId: "aaaaaaaaaaa" });
  });

  it("fails open and retries a later lookup after an error", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ ok: false, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    const original = { site: "youtube", postId: "eeeeeeeeeee", channel: "Chan", title: "Title" } as const;

    await expect(enrichFeedItem(original)).resolves.toEqual(original);
    await expect(enrichFeedItem(original)).resolves.toEqual(original);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
