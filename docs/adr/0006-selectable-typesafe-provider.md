# ADR 0006: Selectable TypeSafe Provider

- Status: Accepted
- Date: 2026-09-24

## Context

The dogfood MVP used a single hosted provider (ADR 0005). TypeSafe's Jev model
is a System One classifier: it answers typed questions about one piece of state
with probabilities instead of generating text. Rule matching is a yes/no
question per post and rule, so Jev fits it directly and needs no JSON parsing
of free-form model output.

## Decision

- Add a provider dropdown in extension settings with GroqCloud
  (`openai/gpt-oss-20b`) and TypeSafe (`jev-latest`). GroqCloud stays the
  default.
- Store one active provider with its own user-supplied API key. Switching
  providers requires a new successful **Save & test**.
- Reset cloud-analysis consent when the saved provider changes, because consent
  names the service that receives post content.
- Request host access to `https://api.typesafe.ai/*` in addition to GroqCloud.
- For TypeSafe, send one System One request per feed item. Each enabled rule is
  one Noul question, and a probability of at least 0.5 is a match.
- Share the bounded retry policy across providers. TypeSafe retries `429` and
  `5xx` responses, including `529 Overloaded`, per feed item.

This decision supersedes the single-provider statement in the product brief and
extends ADR 0005.

## Consequences

- An analysis batch of five posts becomes five TypeSafe requests. TypeSafe's
  published request-rate limit leaves headroom at two concurrent batches.
- Jev returns no explanation, so TypeSafe matches show the default marker text.
- Jev returns only probabilities, so injected instructions in post text cannot
  change the output shape.
- `jev-latest` can move to a new Jev version without an extension release.
  Pin a versioned model ID if match behavior must stay stable.
