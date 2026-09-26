# Morfeed Context

This document defines the shared language used in product discussions, code,
tests, and architecture records.

## Terms

### Feed item

A platform-independent representation of one visible social-feed post. For the
MVP, a Reddit feed item contains visible post content and its subreddit name.
It does not include comments, votes, usernames, or profile data.

### Adapter

Site-specific code that discovers rendered posts and converts them into feed
items. The Reddit adapter must not contain model-provider or rule-evaluation
logic.

### Rule

A user-defined classification criterion. An MVP rule has an identifier, short
name, detailed criterion, enabled state, selected marker color, and saved order.
Rules apply across all supported Reddit post listings. Their order determines
which matching rule supplies a post's border color.

### Match

The model's decision that a feed item satisfies a particular enabled rule. A
match includes the rule identifier and a concise explanation.

### Marker

The Morfeed UI added beside a matching post: a rule-colored badge and post
border. A marker augments the feed without removing or replacing source content.
Users can reveal its explanation or dismiss that match for the current tab.

### Provider

The replaceable boundary through which Morfeed requests rule evaluations. The
user selects one MVP provider: `openai/gpt-oss-20b` through GroqCloud or
`jev-latest` through TypeSafe. Future providers may run locally through WebLLM.

### Analysis batch

Up to five feed items evaluated against every enabled rule. GroqCloud receives
the batch as one request; TypeSafe receives one request per feed item. Morfeed processes no more than two analysis batches concurrently.

### Dogfood MVP

An unpacked Chrome Manifest V3 extension intended for repeated use by the
developer. It is more complete than a technical spike but does not yet meet the
security, onboarding, compatibility, or operational requirements of a public
release.
