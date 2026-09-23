<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product context

Morfeed is a local-first browser extension that analyzes social-feed content
already visible in the DOM. Its core capabilities are passive feed filtering,
structured data collection, and on-demand summarization.

Before making product, UX, or architecture decisions, read
`docs/product-brief.md`, `CONTEXT.md`, and applicable records in `docs/adr/`.
Treat the product brief as the canonical product scope, `CONTEXT.md` as the
shared domain language, and ADRs as the record of settled architecture choices.

Preserve these principles:

- Prefer local inference and local storage by default.
- Do not require platform API keys for the basic experience.
- Minimize the collection, retention, and transmission of personal data.
- Keep users in control of what is analyzed, hidden, highlighted, or saved.
- Treat platform terms, privacy requirements, and legal obligations as product
  constraints. Never claim that reading the DOM bypasses them.
- Keep site-specific DOM extraction isolated from platform-independent analysis
  and collection logic.

## Code comments

- Add comments only when they explain a non-obvious reason, constraint, or
  tradeoff.
- Do not narrate what the code does when the implementation already makes that
  clear.
- Keep essential comments concise, especially comments explaining why a choice
  was made.
