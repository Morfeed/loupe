/* X post links built from a feed item */
import type { XFeedItem } from "../core/types";

/* X resolves the author from the post ID, so the link needs no username */
export function xPostUrl(item: XFeedItem): string {
  return `https://x.com/i/status/${item.postId}`;
}
