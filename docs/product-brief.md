# Loupe Product Brief

## Purpose

Social-media feeds contain useful signals—such as deals, job posts, leads,
sentiment, events, product mentions, and research material—but finding them
usually requires manually scrolling through and reading large amounts of noise.

Loupe is a lightweight, local-first browser extension that helps users find
and organize those signals while they browse. It reads content already rendered
in the current page, applies user-configurable analysis, and changes or augments
the browsing experience in real time.

The basic experience should not require platform API keys, paid scraping
services, or user-managed backend infrastructure.

## Current MVP direction

The first delivery target is a dogfood-quality, unpacked Chrome Manifest V3
extension. It should be useful repeatedly on the developer's own browser rather
than serving only as a technical demo or being polished for external release.

The MVP will validate Reddit post listings and YouTube video listings (see ADR
0007). X and other platforms are out of scope until a later product decision.

The first vertical slice is intentionally narrower than the full product
vision: it focuses on evaluating visible feed items against user-defined rules
and providing inline filtering or insight. Structured collections and on-demand
thread summarization remain later product capabilities unless a subsequent MVP
decision brings them into scope.

The MVP will use one hosted text model to reach the dogfood loop quickly. The
provider boundary must remain small enough to replace that provider with
in-browser WebLLM later. The MVP lets the user select one of two hosted
providers (see ADR 0006).
Because feed text leaves the browser in this phase, the interface must disclose
when cloud analysis is active and must never bundle a shared production API key.

The initial model is `openai/gpt-oss-20b` through GroqCloud. Groq's free tier is
acceptable for dogfooding and avoids workspace, region, model-deployment, and
billing setup. The MVP does not automatically upgrade or enable paid billing.

Users create rules with a short name, a detailed matching criterion, an enabled
switch, and a selected marker color. For example, a rule named "Toxic post"
might use the criterion "Contains direct insults, harassment, threats, or
demeaning language." Enabled rules are evaluated against newly observed Reddit
posts.

A matching result adds a Loupe badge and colored border directly alongside
the post in the page DOM. The color comes from the matching rule and is selected
through a color swatch in the rule editor. Each rule also selects an action:
mark the post, hide it behind a `Show` placeholder, or remove it from view.
Hidden and removed posts stay in the page DOM so that they can be restored
(see ADR 0008).

Only the visible post content and subreddit name are sent to the hosted model.
Usernames, vote data, permalinks, comments, and unrelated page content remain
local. Post text is normalized and truncated to 4,000 characters without
automatically expanding collapsed content. The user's Groq API key is entered
through extension settings, stored in `chrome.storage.local`, and used by the
extension background service worker.
Local storage is restricted to trusted extension contexts, and the Reddit
content script receives sanitized rule state without credentials. Credentials
must never be committed or embedded in the extension bundle. A
"Save and test" action validates the configuration, and analysis remains
disabled until validation succeeds.

The primary configuration surface is a simple React extension popup. It manages
rules, enabled switches, marker colors, pause state, and analysis status. Cloud
credentials belong in a separate extension options page. The popup may use
shadcn/ui components, but it remains an extension entrypoint rather than a
Next.js page.

The extension package uses WXT, React, TypeScript, Tailwind CSS, and
shadcn/ui. The existing Next.js website and the extension remain separate build
targets inside this repository. Compatible design tokens and client-side UI
patterns may be shared, but Next.js runtime features must not enter extension
entrypoints.

The rule editor offers eight accessible preset color swatches. If multiple
rules match one post, Loupe displays one badge per matching rule and uses the
first matching rule's color for the post border. Selecting a badge reveals a
concise one-sentence explanation; no model-generated confidence percentage is
shown.

Posts are scheduled for analysis only when entering or approaching the viewport.
Processing is queued with bounded concurrency and deduplicated using the post
content and active rule definitions. Criteria or enabled-state changes trigger
re-evaluation of currently rendered posts. Color-only changes update existing
markers without another model request.

The MVP supports at most eight rules. Analysis requests contain up to five
posts and every enabled rule, with no more than two requests in flight. The
provider returns one result for every post/rule pair containing `postId`,
`ruleId`, `matched`, and a one-sentence `reason` when matched. Model output is
data only: it contains no HTML and no confidence score.

Rules, rule order, marker colors, enabled states, global settings, and cloud
credentials persist locally. Full feed content and analysis caches remain in
memory for the current tab and are discarded with that tab. Reloading a page
may therefore reanalyze visible posts. A local history keeps a compact record of
each analyzed item (title, source, link, matching rules, and action) in
IndexedDB for a user-selected period. Users review, export, and delete it on a
dashboard page (see ADR 0009).

A master pause switch stops new analysis while retaining existing markers. A
separate clear action removes all Loupe markers and borders from the current
tab, shows hidden and removed posts, and keeps those matches dismissed for the
tab. Missing credentials, exhausted quota, network errors, or invalid model
output must fail open and leave Reddit content unchanged. Temporary failures
use bounded exponential backoff; authentication and quota failures wait for
explicit user action instead of retrying continuously.

The master enabled state persists across browser restarts. With valid
credentials and at least one enabled rule, Loupe starts automatically on a
supported Reddit listing. The popup reports `Setup required`, `Ready`,
`Analyzing`, `Paused`, or `Error` and always shows a `Cloud` indicator while the
MVP uses hosted inference. Before analysis is enabled for the first time, the
user must acknowledge that visible post content will be sent to the selected
provider. Changing the provider requires that acknowledgment again.

Rules apply to every supported Reddit post listing; subreddit-specific scope is
deferred. A rule name is required and limited to 40 characters, its criterion is
required and limited to 500 characters, and its color must come from the eight
preset swatches. Duplicate display names are allowed because internal IDs are
unique. Move-up and move-down controls change saved rule order.

Expanding a marker reveals its explanation and a dismiss action. Dismissal
removes that rule's match for the post in the current tab only. Remaining
matches stay visible, and the next matching rule in saved order supplies the
border color. Markers follow the system light/dark preference, expose text in
addition to color, support keyboard interaction, and maintain sufficient color
contrast.

The Reddit adapter supports only modern desktop post listings at
`https://www.reddit.com/*`. Old Reddit, mobile layouts, comment threads, search
results, and embedded posts are outside the MVP. The extension requests only
storage access plus host access to the supported Reddit origin and the GroqCloud
and TypeSafe API endpoints.

Each matching post receives a small, style-isolated Loupe marker row near the
beginning of its card. The marker uses normal document flow rather than absolute
positioning, and the post receives an outline in the first matching rule's
color.

X is outside the MVP rather than a parallel workstream. The existing Next.js
website remains in the repository, and the Chrome extension will be added as an
isolated workspace in the same repository.

## Product principles

### Local first

Prefer in-browser inference and local storage. If hosted inference or syncing is
added, it must be optional and clearly disclose what data leaves the device.

### User controlled

Users decide which sites are enabled, what content is analyzed, which rules are
active, and what information is saved. They must be able to inspect, edit,
disable, and delete their rules and collections.

### Useful while browsing

Analysis should happen within the user's existing browsing flow. The extension
should provide value without requiring a separate scraping job or dashboard to
be configured first.

### Privacy conscious

Collect and retain the minimum content required for the chosen feature. Avoid
capturing private or sensitive information unnecessarily, and make storage and
retention behavior visible to the user.

### Platform aware

Reading rendered DOM content avoids depending on official APIs, but it does not
eliminate platform terms, privacy obligations, copyright considerations, or
technical restrictions. Site support must be designed and described
accordingly.

## Core product loop

### 1. Passive filtering

As the user scrolls, Loupe observes newly rendered feed items and evaluates
them against user-defined criteria.

Example rules:

- Hide arguments or rage-bait.
- Highlight job postings matching selected roles or locations.
- Surface posts about a particular topic.
- Tag posts that express a specific sentiment or intent.

Possible actions include highlighting, labeling, collapsing, hiding, or ranking
matching items. Users should be able to understand why an item matched and undo
the action.

### 2. Active extraction

Users create collections describing information they want to gather as they
browse. Loupe identifies matching posts and extracts structured fields into
the relevant collection.

Example collections:

- Leads: person, company, need, contact information, and source URL.
- Jobs: role, company, location, compensation, and application link.
- Events: name, date, location, organizer, and registration link.
- Product mentions: product, sentiment, use case, and quoted evidence.
- Research notes: claim, source, author, date, and relevant excerpt.

Every saved item should retain enough source context for the user to verify it.
Users should be able to edit, deduplicate, export, and delete collected data.

### 3. On-demand summarization

Users can request a summary of the content currently available on a page, such
as a thread, comment section, or a profile's recently loaded activity.

Summaries should distinguish visible evidence from model inference, preserve
links back to sources, and state when only part of a conversation was available
to analyze.

## Initial platform scope

Reddit post listings are the only supported platform surface for the MVP.
Longer-term candidates include X, Facebook, LinkedIn, and Instagram.
Support should be added through isolated, site-specific adapters rather than a
single set of fragile global selectors.

## Technical direction

### Content acquisition

- A browser content script inspects supported feed items already rendered in the
  page DOM.
- A `MutationObserver` detects items added by infinite scrolling or client-side
  navigation.
- Site adapters normalize platform-specific markup into a common post shape.
- Processing should be bounded, deduplicated, and scheduled to avoid degrading
  page responsiveness.

### Analysis

- The dogfood MVP uses one hosted text model behind a narrow provider boundary.
- The longer-term default remains a small local model running through
  browser-compatible technology such as WebGPU, WebLLM, or WASM when it
  provides acceptable quality and latency.
- Allow deterministic rules and keyword filters for tasks that do not need a
  model.
- Hosted inference must clearly disclose that post content leaves the device
  and must use user-supplied credentials rather than a bundled shared key.
- Prompts and output schemas should be configurable per rule and, where
  necessary, per site.

### Storage

- Store preferences, rules, and collections locally by default.
- Keep source URLs and minimal verification context with extracted records.
- Define retention, deletion, import, and export behavior before storing
  substantial feed content.

### Interface

- Inline feed annotations show matches without obscuring the original source.
- An extension popup or side panel manages rules, collections, and current-page
  actions.
- A collection view supports review, correction, export, and deletion.
- Clear status indicators communicate when analysis is active, unavailable, or
  using a hosted service.

## Non-goals for the initial version

- Crawling feeds while the user is not actively browsing them.
- Circumventing authentication, access controls, rate limits, or anti-bot
  protections.
- Claiming universal support across social platforms from the first release.
- Automatically contacting leads, applying for jobs, or publishing content.
- Treating model output as authoritative without links to source material.

## Key risks and constraints

- Social platforms frequently change their DOM, so adapters require testing and
  maintenance.
- Virtualized feeds may remove older items from the DOM and expose only a subset
  of a thread or profile.
- Local models vary in browser support, download size, latency, memory use, and
  extraction quality.
- Feed content may contain sensitive or private data and untrusted text intended
  to manipulate automated systems.
- Browser-extension permissions must be narrow, understandable, and requested
  only when needed.
- Each supported platform's terms and applicable laws must be reviewed before
  release; DOM access is not an exemption from those requirements.

## MVP success criteria

The dogfood MVP is successful when the developer can:

1. Load the unpacked extension in Chrome and enable it on Reddit post listings.
2. Configure the hosted model without embedding a shared API key in the build.
3. Create, enable, disable, and persist a plain-language rule.
4. Scroll an infinite feed and see each newly rendered post evaluated once.
5. See a clear Loupe marker injected beside matching posts without breaking
   Reddit's own interactions or permanently removing content.
6. Understand when analysis is running, failed, paused, or using the cloud.

Verification includes automated coverage for storage, batching, output schema
validation, deduplication, and Reddit DOM fixtures; a production build that
loads unpacked; and a manual 50-post scrolling test with no duplicate markers or
broken Reddit interactions. Under normal connectivity, markers should appear
within three seconds. The first evaluation rule should achieve at least 80%
precision and 80% recall on a hand-labeled set of at least 30 posts.

Structured collections, thread summarization, local inference, additional
platforms, and public distribution are later milestones rather than MVP
acceptance criteria.

## Deferred product questions

These questions are intentionally outside the dogfood MVP:

- Which local WebLLM model provides the best quality, download-size, and latency
  balance?
- How should the product transition away from Groq's free tier before external
  distribution?
- Should rules support subreddit-specific scope?
- When should X or another platform adapter be added?
- Which structured collection and summarization workflows should be built first?
- Which export formats are required for collected data?
- What onboarding, security, and support work is required for public release?
