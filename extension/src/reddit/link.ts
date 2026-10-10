/* Reddit post links built from a feed item */
import type { RedditFeedItem } from "../core/types";

const POST_ID = /^(?:t3_)?([a-z0-9]+)$/i;

/* Reddit redirects a bare comments path to the full post URL, so the post ID is enough */
export function redditPostUrl(item: RedditFeedItem): string | undefined {
  const id = item.postId.match(POST_ID)?.[1];
  return id ? `https://www.reddit.com/comments/${id}/` : undefined;
}
