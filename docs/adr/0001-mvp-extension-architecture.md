# ADR 0001: MVP Extension Architecture

- Status: Accepted; provider configuration superseded by ADR 0005
- Date: 2026-09-21

## Context

Morfeed currently contains a Next.js website and design-system prototypes, but
the dogfood MVP needs Chrome extension entrypoints for a popup, options page,
background service worker, and Reddit content script. The extension UI should
retain the existing visual language without inheriting Next.js server/runtime
assumptions.

## Decision

Keep the website and extension in this repository as separate build targets.
Add an isolated `extension/` package built with WXT, React, TypeScript, Tailwind
CSS, and shadcn/ui.

- Use the React popup for rule management, pause state, and analysis status.
- Use an options page for the Model Studio API key and workspace ID.
- Use a background service worker for hosted-model requests.
- Use a Reddit content script for observation, normalized feed-item extraction,
  scheduling, and marker mounting.
- Keep site adapters independent from rule evaluation and model providers.
- Share only framework-neutral design tokens and compatible client components.
  Do not import Next.js server actions or `next/*` modules into the extension.
- Isolate injected marker styles from Reddit. Markers augment source content and
  never render model output as trusted HTML.

## Consequences

- The website and extension can evolve and deploy independently while remaining
  in one repository.
- Extension entrypoints and permissions are explicit instead of being forced
  through the Next.js build.
- Some UI source may be duplicated initially if extracting a shared UI package
  would slow the MVP.
- WXT becomes an extension-specific dependency and convention.
- Supporting another browser or platform still requires deliberate validation;
  it is not implied by the framework choice.

## Deferred decisions

- Analysis batch size, concurrency, and retry behavior.
- Session caching and retention of classification results.
- A future in-browser WebLLM provider.
- Public distribution and non-Chromium compatibility.
