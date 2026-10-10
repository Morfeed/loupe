# ADR 0008: Rule Actions

- Status: Accepted
- Date: 2026-10-10

## Context

Markers only augment a feed. Rules such as "Rage-bait" exist to reduce noise,
and a badge on every noisy post still costs the user attention and scroll
space. The product brief lists collapsing and hiding as intended filtering
actions.

## Decision

- Each rule has one action: `Mark`, `Hide`, or `Remove`. New rules and stored
  rules without an action use `Mark`.
- `Mark` keeps the current badge and border behavior from ADR 0004.
- `Hide` collapses the post to a placeholder that names the matching hide rules
  and offers a `Show` button. `Show` reveals the post as a marked post for the
  current tab.
- `Remove` hides the post with no Loupe UI.
- When several rules match, the strongest action applies:
  `Remove` > `Hide` > `Mark`. The first matching rule still supplies the border
  color.
- Hide and remove use CSS `display: none` on an attribute that Loupe sets. Loupe
  never detaches site elements, because Reddit and YouTube own and reuse them.
- Each adapter declares a hide target. Reddit hides the post element and puts
  the placeholder before it. YouTube keeps the grid tile and hides its contents,
  because a placeholder outside the tile gets no grid cell.
- Action changes do not trigger reanalysis.
- `Clear markers` dismisses every current match in the tab. Hidden and removed
  posts become visible and stay visible when they reenter the viewport.

This decision supersedes the statement in the product brief and ADR 0004 that
a marker must not remove or obscure source content.

## Consequences

- Users can reduce noise without leaving the feed. The undo paths are `Show`,
  dismissal, `Clear markers`, or a change of the rule action.
- A removed post gives no signal in the page. A false positive from the model
  is invisible until the user clears markers or changes the rule.
- Removing tiles on YouTube shifts later tiles in the grid. Hidden tiles keep
  their grid cell.
- A site redesign can change which hide target works. The target stays an
  adapter concern.
