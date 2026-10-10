# ADR 0009: Local Analysis History

- Status: Accepted
- Date: 2026-10-10

## Context

Analysis results exist only in tab memory. The user cannot see what Loupe
matched, hid, or removed after scrolling past it, and cannot review misses to
improve a rule criterion. The product brief requires feed results to be
discarded with the tab, and it asks for minimal and visible retention.

## Decision

- Save one history record for every analyzed feed item, matched or not.
- A record holds the site, item ID, title, subreddit or channel, a link, the
  matching rules with their reasons, the resulting action, the provider, and
  two timestamps. It does not hold post bodies, video descriptions, keywords,
  or any page content beyond the title.
- Copy the rule name, color, and action into each record so that later rule
  changes do not alter history.
- Build links locally from the item ID. Links are not part of the feed item, so
  they are never sent to the provider.
- Store records in IndexedDB on the extension origin, in a database named
  `loupe`. Request `unlimitedStorage` so that Chrome does not evict the data
  under disk pressure.
- The background worker writes records after a successful analysis. A failed
  write never fails the analysis.
- Analyzing the same item again updates its record and keeps its first-seen
  time.
- Delete records older than the retention period (1, 7, or 30 days, default 7)
  and the oldest records above 2,000. Pruning runs when the worker starts, after
  writes at most once a minute, and when the dashboard opens.
- History is on by default. The popup always shows its state and retention. The
  dashboard can turn it off, change retention, export records as JSON, and
  delete all records.
- The dashboard is an extension page at `dashboard.html`. It reads all records
  into memory and filters there. It receives new records through a
  `BroadcastChannel`.
- Dismiss and Show actions in a tab are not recorded.

This decision supersedes the statement in the product brief that classification
results are discarded with the tab.

## Consequences

- Users can audit matches, find misses, and tune criteria from real data.
- Titles of viewed posts and videos persist on disk for up to the retention
  period. Chrome does not encrypt IndexedDB files.
- Uninstalling Loupe or clearing extension data deletes the history.
- The history shows the action that the rules decided, not what the user later
  did in the tab.
- New indexes require a database version upgrade.
