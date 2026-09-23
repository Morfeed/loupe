# Morfeed

Morfeed is a local-first browser extension concept for finding useful signal in
social-media feeds. It analyzes content already visible in the browser so users
can filter noise, collect structured information, and summarize conversations
without needing platform API keys or separate scraping infrastructure.

## Product goals

- Filter or highlight posts using user-defined criteria.
- Extract matching information into reusable collections as the user browses.
- Summarize threads, comment sections, or recent profile activity on demand.
- Prefer local inference and local storage so the basic experience has no
  ongoing model cost and minimizes data exposure.
- Treat platform terms, user privacy, and user control as product constraints.

The canonical product definition, including scope and design principles, lives in
[docs/product-brief.md](docs/product-brief.md).

## Development

The repository contains the existing Next.js app and a standalone WXT browser
extension package in `extension/`.

### Browser extension

Requires Node.js 20.12 or newer.

```bash
npm install
cd extension
npm install
cd ..
npm run build:extension
```

Load `extension/.output/chrome-mv3` as an unpacked extension from
`chrome://extensions` with Developer mode enabled. Open the extension settings,
enter a Groq API key, then use **Save & test**. Rules can then be added from the
popup while browsing modern Reddit post listings.

Useful commands:

```bash
npm run dev:extension
npm run lint:extension
npm run test:extension
npm run typecheck:extension
npm run build:extension
```

### Website

```bash
npm install
npm run dev
```

Before making product or architecture decisions, read
[docs/product-brief.md](docs/product-brief.md) and the repository instructions
in [AGENTS.md](AGENTS.md).
