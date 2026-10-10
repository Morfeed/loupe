# ADR 0007: YouTube Video Listings

- Status: Accepted
- Date: 2026-10-04

## Context

The dogfood MVP supported Reddit post listings only. YouTube feeds have the
same noise problem, but a video tile shows little text: a title, a channel, and
sometimes view counts. A title alone is often not enough to decide whether a
video matches a rule such as "Sponsored product review" or "Beginner
tutorial".

YouTube's own web client loads public video details from its InnerTube player
endpoint. That response includes the description, keywords, category,
duration, publish date, and live-stream state in about 5 KB, without
authentication. The official YouTube Data API returns similar data but requires
a user-supplied Google API key and daily quota, which the product brief rejects
for the basic experience.

## Decision

- Add a YouTube adapter for `https://www.youtube.com/*`. It supports video
  tiles on the home feed, subscriptions, search results, channel pages,
  playlists, and watch-page recommendations, including Shorts tiles.
- Exclude mobile YouTube, YouTube Music, embedded players, playlists and mixes
  shown as one tile, and ads.
- Use the video ID as the feed item ID. Extract the visible title and channel
  from the tile.
- Before analysis, enrich each queued video with public details from
  `/youtubei/v1/player`. Send the request from the content script without
  cookies so it is not tied to the signed-in account.
- Request details only for videos that are already queued for analysis. Cache
  them in current-tab memory and forget failed lookups.
- Limit the description to 1,000 characters and keywords to 20 entries to keep
  analysis batches inside free-tier token limits.
- Fail open. When enrichment fails, analyze the visible title and channel only.
- Do not send view counts, comments, or account data to the model provider.
- Place the marker row after the tile content so grid rows stay aligned.
- Move scheduling and marker code into a site-independent feed controller that
  depends only on the `SiteAdapter` interface.

This decision extends the platform scope in the product brief and ADR 0003.

## Consequences

- Rules can use the description and keywords, which improves matching for
  videos with vague titles.
- InnerTube is an undocumented internal API. YouTube can change or restrict it
  without notice. Enrichment then stops and analysis falls back to the title.
- Each analyzed video makes one additional same-origin request to YouTube. The
  request count is bounded by the existing two-batch concurrency limit.
- YouTube's terms restrict automated access. This is acceptable for the
  dogfood MVP because Loupe reads only videos that the user's page already
  shows. Review this before public distribution, and consider the official Data
  API as an opt-in alternative.
- Cloud consent text now names YouTube video details. Consent given before this
  change is not requested again.
