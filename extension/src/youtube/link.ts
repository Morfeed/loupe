/* YouTube video links built from a feed item */
import type { YouTubeFeedItem } from "../core/types";

export function youtubeVideoUrl(item: YouTubeFeedItem): string {
  return item.isShort
    ? `https://www.youtube.com/shorts/${item.postId}`
    : `https://www.youtube.com/watch?v=${item.postId}`;
}
