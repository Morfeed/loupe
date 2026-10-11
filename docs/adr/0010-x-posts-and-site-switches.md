# ADR 0010: X Posts and Site Switches

- Status: Accepted
- Date: 2026-10-10

## Context

Loupe supports Reddit post listings and YouTube video listings. X timelines
have the same noise problem, and the product brief deferred X until a later
product decision. With three sites, one master switch is not enough: a user
can want Loupe on YouTube but not on X, and X posts come from personal accounts
that the user may not want to send to a cloud provider.

## Decision

- Add an X adapter for `https://x.com/*`. It supports post timelines: home,
  lists, profiles, bookmarks, and search results.
- Exclude status pages, because they show a conversation and its replies are
  comments. Exclude `twitter.com`, mobile layouts, and embedded posts.
- Use the post ID from the post's own timestamp link as the feed item ID.
- Send the visible post text and the text of a quoted post. Truncate the
  combined text to 4,000 characters and do not expand "Show more".
- Do not send the author name or handle, reposter, counts, media, or replies.
  Rules therefore cannot match by author.
- Skip posts with no text, such as media-only posts.
- Treat promoted posts as normal posts. X has no stable marker for them.
- History stores the first 140 characters of the post text as the title, no
  source, and a link of the form `https://x.com/i/status/{id}`, which needs no
  username.
- Add one switch per site. The popup shows the switches, and the switches
  persist with the other settings. Turning a site off removes its markers and
  shows its hidden posts. Turning it on again restores markers from the tab
  cache without new requests.
- The background worker rejects an analysis batch for a site that is off.
- X is off by default. Reddit and YouTube are on by default, so existing users
  see no change.
- Marker clicks and key presses do not propagate to the page, because X opens a
  post on any click inside it.

This decision extends the platform scope in the product brief and ADR 0007.

## Consequences

- Users choose per site what Loupe analyzes, which matches the "user
  controlled" principle.
- Host permissions stay static for all three sites. Optional host permissions
  that Loupe requests when the user turns a site on are a better fit for
  public release.
- X DOM selectors use `data-testid` attributes that X can change without
  notice. Extraction then fails open and X posts get no Loupe markers.
- Without the author, rules such as "posts from news accounts" do not work.
- X's terms restrict automated access. As with YouTube, this is acceptable for
  the dogfood MVP because Loupe reads only posts that the user's page already
  shows. Review this before public distribution.
