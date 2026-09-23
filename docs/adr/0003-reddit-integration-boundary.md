# ADR 0003: Reddit Integration Boundary

- Status: Accepted; provider host permission superseded by ADR 0005
- Date: 2026-09-21

## Context

Supporting every Reddit layout and retaining arbitrary page data would expand
the MVP substantially. The content script also needs narrow permissions and a
marker strategy that does not interfere with Reddit interactions.

## Decision

- Support modern desktop post listings at `https://www.reddit.com/*` only.
- Exclude Old Reddit, mobile layouts, comments, search results, and embedded
  posts.
- Normalize the visible post title and body to plain text, limit the combined
  content to 4,000 characters, and include the subreddit name.
- Do not automatically expand collapsed content.
- Do not send usernames, votes, permalinks, comments, or unrelated page content
  to the provider.
- Request only the `storage` and `tabs` permissions, the supported Reddit host
  permission, and host access to the configured Model Studio Singapore
  endpoint. The `tabs` permission supports current-tab marker clearing and
  sanitized rule-state updates to open Reddit tabs.
- Mount a style-isolated marker row near the beginning of a matching post using
  normal document flow. Apply a colored outline to the post without replacing,
  hiding, or restructuring its content.
- Require successful "Save and test" credential validation before enabling
  analysis.

## Verification

- Unit tests cover rule storage, batching, provider output validation, and
  deduplication.
- DOM fixture tests cover initial discovery, infinite-scroll additions, marker
  mounting, marker cleanup, and duplicate prevention.
- A production build loads as an unpacked Chrome extension without errors.
- A manual test scrolls through at least 50 posts without duplicate markers or
  broken Reddit interactions.
- Under normal connectivity, matching posts are marked within three seconds.
- The initial rule reaches at least 80% precision and recall on a hand-labeled
  set of at least 30 posts.

## Consequences

- Reddit DOM changes can still break extraction and require fixture updates.
- Unsupported layouts fail open and receive no Morfeed augmentation.
- Truncation controls cost but may omit relevant text near the end of a long
  post.
- Narrow host permissions reduce unnecessary access and make MVP behavior easier
  to explain.
