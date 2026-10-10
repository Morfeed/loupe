import { beforeEach, describe, expect, it } from "vitest";
import fixture from "./fixtures/reddit-listing.html?raw";
import { extractFeedItem, findPostElements, isSupportedRedditFeed } from "../src/reddit/adapter";

describe("Reddit adapter", () => {
  beforeEach(() => {
    document.body.innerHTML = fixture;
  });

  it("extracts modern and fallback listing posts", () => {
    const posts = findPostElements(document);
    expect(posts).toHaveLength(2);
    expect(extractFeedItem(posts[0]!)).toEqual({
      site: "reddit",
      postId: "t3_alpha",
      title: "A frontend role",
      body: "We are hiring a React engineer in Toronto.",
      subreddit: "webdev",
    });
    expect(extractFeedItem(posts[1]!)).toMatchObject({
      postId: "t3_beta",
      title: "TypeScript 6 discussion",
      subreddit: "typescript",
    });
  });

  it("only accepts supported reddit listing routes", () => {
    expect(isSupportedRedditFeed(new URL("https://www.reddit.com/r/webdev/"))).toBe(true);
    expect(isSupportedRedditFeed(new URL("https://www.reddit.com/r/webdev/comments/abc/post/"))).toBe(false);
    expect(isSupportedRedditFeed(new URL("https://www.reddit.com/search/?q=jobs"))).toBe(false);
    expect(isSupportedRedditFeed(new URL("https://old.reddit.com/r/webdev/"))).toBe(false);
  });
});
