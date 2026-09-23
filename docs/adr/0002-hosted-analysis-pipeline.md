# ADR 0002: Hosted Analysis Pipeline

- Status: Accepted
- Date: 2026-09-21

## Context

The dogfood MVP must classify newly visible Reddit posts quickly without
creating unbounded model cost, storing browsing history, or damaging the source
page when cloud inference fails.

## Decision

- Support at most eight rules in the MVP.
- Schedule posts when they enter or approach the viewport.
- Send up to five posts and every enabled rule in one analysis request.
- Allow no more than two analysis requests concurrently.
- Deduplicate work using the normalized post content and active rule
  definitions.
- Keep feed content, queued work, and results in current-tab memory only.
- Persist rules, settings, rule order, marker colors, enabled states, and cloud
  credentials in `chrome.storage.local`.
- Restrict local storage to trusted extension contexts. The content script
  receives only sanitized rules, global state, and a provider-ready flag from
  the background service worker; it never receives cloud credentials.
- Reanalyze rendered posts when criteria or enabled states change. Apply
  color-only changes locally without another provider request.
- Pause stops new analysis without removing existing markers. Clearing markers
  is a separate explicit action.
- Fail open on every provider or parsing error. Retry only temporary failures
  using bounded exponential backoff; do not automatically retry authentication
  or quota failures.

The provider returns JSON with one result for each post/rule pair:

```json
{
  "results": [
    {
      "postId": "local-id",
      "ruleId": "rule-id",
      "matched": true,
      "reason": "One concise sentence explaining the match."
    }
  ]
}
```

The reason is required only for a match. Provider output contains neither HTML
nor a confidence score. All values are schema-validated and rendered as text.

## Consequences

- Batching reduces repeated rule tokens and request count while keeping latency
  bounded.
- Closing or reloading a tab discards cached results and may cause repeated
  inference calls.
- The extension does not create a persistent history of viewed posts.
- A provider outage reduces augmentation but never hides or breaks Reddit
  content.
- Eight rules and two concurrent requests are intentional MVP limits, not
  permanent product constraints.
