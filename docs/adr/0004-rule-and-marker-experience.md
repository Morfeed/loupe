# ADR 0004: Rule and Marker Experience

- Status: Accepted; cloud provider disclosure superseded by ADR 0005
- Date: 2026-09-21

## Context

Rules and inline markers form the main dogfood interaction. Their behavior must
remain understandable when multiple rules match, allow users to undo incorrect
results, and communicate that classification uses a hosted provider.

## Decision

### Rules

- Support at most eight rules.
- Apply every enabled rule across all supported Reddit post listings.
- Require a name of at most 40 characters and a criterion of at most 500
  characters.
- Require one of eight accessible preset marker colors.
- Allow duplicate display names while assigning a unique internal identifier.
- Persist rule order and provide move-up and move-down controls.
- Use the first matching enabled rule in saved order as the post border color.

### Markers

- Display one badge for each matching rule.
- Clicking or keyboard-activating a badge reveals its one-sentence explanation.
- Provide a dismiss action that suppresses that post/rule match for the current
  tab only.
- When a dismissed match supplied the border color, use the next matching rule's
  color or remove the border when no matches remain.
- Follow system light/dark preference, meet contrast requirements, and never
  rely on color alone to communicate a match.

### Runtime status and consent

- Persist the master enabled state across browser restarts.
- Start automatically on supported Reddit pages when credentials are valid and
  at least one rule is enabled.
- Report `Setup required`, `Ready`, `Analyzing`, `Paused`, or `Error` in the
  popup.
- Always show a `Cloud` indicator while using hosted inference.
- Require a one-time acknowledgment that visible post content is sent to Qwen
  before first enabling analysis.

## Consequences

- The UI remains bounded and keyboard-accessible.
- Rule ordering has visible meaning and must remain stable in storage.
- Dismissals disappear when the tab closes and do not create browsing history.
- The cloud disclosure remains visible even after initial consent.
- Per-subreddit rules and arbitrary color pickers remain later enhancements.
