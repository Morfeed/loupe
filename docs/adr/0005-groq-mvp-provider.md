# ADR 0005: Groq MVP Provider

- Status: Accepted
- Date: 2026-09-22

## Context

The original Alibaba Cloud Model Studio provider required region-specific
service activation, a matching workspace, and model permissions. That setup
blocked the dogfood loop before the extension could validate its core Reddit
classification experience.

## Decision

- Use GroqCloud's OpenAI-compatible chat completions endpoint.
- Use `openai/gpt-oss-20b` for the dogfood MVP.
- Require only a user-supplied Groq API key in extension settings.
- Request host access only to `https://api.groq.com/*` for model inference.
- Persist a provider kind with credentials and invalidate previously saved
  provider credentials when the kind does not match `groq`.
- Keep provider output validation, bounded retries, and fail-open behavior.

This decision supersedes the provider-specific parts of ADR 0001, the Model
Studio host permission in ADR 0003, and the Qwen disclosure in ADR 0004.

## Consequences

- Setup no longer requires a workspace ID, region selection, model deployment,
  or Model Studio service activation.
- Groq free-tier availability and rate limits remain external constraints.
- Visible post content, subreddit names, and enabled rules are sent to
  GroqCloud until a local WebLLM provider is implemented.
- The OpenAI-compatible boundary remains replaceable by another hosted or local
  provider.
