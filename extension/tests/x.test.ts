import { beforeEach, describe, expect, it } from "vitest";
import fixture from "./fixtures/x-timeline.html?raw";
import { extractFeedItem, findPostElements, isSupportedXPage, xAdapter } from "../src/x/adapter";
import { xPostUrl } from "../src/x/link";

describe("X adapter", () => {
  beforeEach(() => {
    document.body.innerHTML = fixture;
  });

  it("finds posts and maps nested nodes to their post", () => {
    expect(findPostElements(document).map((element) => element.id)).toEqual(["plain-post", "quote-post", "quote-only-post", "media-post"]);
    const cell = document.querySelector<HTMLElement>("#quote-post")!.closest<HTMLElement>("[data-testid='cellInnerDiv']")!;
    expect(findPostElements(cell).map((element) => element.id)).toEqual(["quote-post"]);
    expect(xAdapter.closestItemElement(document.querySelector("#quote-post div[role='link'] span")!)?.id).toBe("quote-post");
  });

  it("extracts post text without usernames", () => {
    const item = extractFeedItem(document.getElementById("plain-post")!);
    expect(item).toEqual({ site: "x", postId: "1840000000000000001", text: "We are hiring a #React engineer in Toronto." });
    expect(JSON.stringify(item)).not.toMatch(/frontenddev|Frontend Dev/);
  });

  it("keeps quoted text separate and uses the post's own timestamp for its ID", () => {
    expect(extractFeedItem(document.getElementById("quote-post")!)).toEqual({
      site: "x",
      postId: "1840000000000000002",
      text: "This take is wild",
      quote: "Tabs are better than spaces.",
    });
    expect(extractFeedItem(document.getElementById("quote-only-post")!)).toEqual({
      site: "x",
      postId: "1840000000000000003",
      text: "",
      quote: "Quoted launch news",
    });
  });

  it("skips posts with no text to analyze", () => {
    expect(extractFeedItem(document.getElementById("media-post")!)).toBeNull();
  });

  it("supports x.com feeds and skips conversation pages", () => {
    expect(isSupportedXPage(new URL("https://x.com/home"))).toBe(true);
    expect(isSupportedXPage(new URL("https://x.com/search?q=react"))).toBe(true);
    expect(isSupportedXPage(new URL("https://x.com/frontenddev"))).toBe(true);
    expect(isSupportedXPage(new URL("https://x.com/frontenddev/status/1840000000000000001"))).toBe(false);
    expect(isSupportedXPage(new URL("https://twitter.com/home"))).toBe(false);
  });

  it("builds a post link without the author", () => {
    expect(xPostUrl({ site: "x", postId: "1840000000000000001", text: "" })).toBe("https://x.com/i/status/1840000000000000001");
  });
});
