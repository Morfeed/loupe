# Loupe Context

This document defines the shared language used in product discussions, code,
tests, and architecture records.

## Terms

### Feed item

A platform-independent representation of one visible social-feed post. For the
MVP, a Reddit feed item contains visible post content and its subreddit name. A
YouTube feed item contains the video title and channel, enriched with public
video details such as description, keywords, category, and duration. Feed
items do not include comments, votes, view counts, usernames, or profile data.

### Adapter

Site-specific code that discovers rendered posts and converts them into feed
items. A YouTube adapter may also fetch public details for a visible video.
Adapters must not contain model-provider or rule-evaluation logic.

### Enrichment

An optional adapter step that adds public details to a feed item before
analysis. Enrichment fails open: a failed lookup leaves the item as extracted
from the page.

### Rule

A user-defined classification criterion. An MVP rule has an identifier, short
name, detailed criterion, enabled state, selected marker color, action, and
saved order.
Rules apply across all supported Reddit post listings and YouTube video listings. Their order determines
which matching rule supplies a post's border color.

### Action

What Loupe does to a post that matches a rule: `Mark` adds a marker, `Hide`
collapses the post behind a placeholder with a `Show` button, and `Remove`
hides the post with no Loupe UI. The strongest action of all matching rules
applies. Hide and remove never detach site elements (see ADR 0008).

### Match

The model's decision that a feed item satisfies a particular enabled rule. A
match includes the rule identifier and a concise explanation.

### Marker

The Loupe UI added beside a matching post: a rule-colored badge and post
border, shown for the `Mark` action or after the user selects `Show`. Users can
reveal its explanation or dismiss that match for the current tab.

### History record

A compact, local record of one analyzed feed item: its title, subreddit or
channel, a locally built link, the matching rules with reasons, and the
resulting action. History records live in the extension's IndexedDB, expire
after the retention period, and never contain post bodies or video
descriptions (see ADR 0009).

### Provider

The replaceable boundary through which Loupe requests rule evaluations. The
user selects one MVP provider: `openai/gpt-oss-20b` through GroqCloud or
`jev-latest` through TypeSafe. Future providers may run locally through WebLLM.

### Analysis batch

Up to five feed items evaluated against every enabled rule. GroqCloud receives
the batch as one request; TypeSafe receives one request per feed item. Loupe processes no more than two analysis batches concurrently.

### Dogfood MVP

An unpacked Chrome Manifest V3 extension intended for repeated use by the
developer. It is more complete than a technical spike but does not yet meet the
security, onboarding, compatibility, or operational requirements of a public
release.
