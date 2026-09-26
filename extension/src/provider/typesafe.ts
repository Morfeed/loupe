/* TypeSafe System One provider that asks one Noul question per rule */
import { PROVIDERS } from "../core/constants";
import type { FeedItem, MatchResult, Rule } from "../core/types";
import { isTransientStatus, ProviderError, withRetries } from "./shared";

/* Noul is P(yes). A false positive only adds a dismissible marker, so an even threshold is enough. */
export const MATCH_THRESHOLD = 0.5;

interface SystemOneResponse {
  answers?: Record<string, { noul?: unknown }>;
  detail?: unknown;
}

export function providerEndpoint(): string {
  return "https://api.typesafe.ai/v1/systemone";
}

/* The API does not document which characters a question ID accepts, so use index keys */
function questionId(index: number): string {
  return `rule_${index}`;
}

function questionsFor(rules: Rule[]) {
  return Object.fromEntries(rules.map((rule, index) => [
    questionId(index),
    { type: "noul", instructions: `The post matches the rule "${rule.name}": ${rule.criterion}` },
  ]));
}

/* Auth errors put an object in detail. Validation errors can put a list in detail. */
function errorDetail(payload: SystemOneResponse): string | undefined {
  const [first] = Array.isArray(payload.detail) ? payload.detail : [payload.detail];
  const detail = typeof first === "string"
    ? first
    : (first as { message?: unknown; msg?: unknown } | undefined)?.message ?? (first as { msg?: unknown } | undefined)?.msg;
  return typeof detail === "string" ? `TypeSafe: ${detail.slice(0, 240)}` : undefined;
}

async function requestPost(apiKey: string, item: FeedItem, rules: Rule[]): Promise<MatchResult[]> {
  const response = await fetch(providerEndpoint(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: PROVIDERS.typesafe.model,
      state: { subreddit: item.subreddit, title: item.title, body: item.body },
      questions: questionsFor(rules),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as SystemOneResponse;
  if (!response.ok) {
    throw new ProviderError(errorDetail(payload) ?? `TypeSafe returned HTTP ${response.status}.`, isTransientStatus(response.status));
  }

  return rules.map((rule, index) => {
    const probability = payload.answers?.[questionId(index)]?.noul;
    if (typeof probability !== "number" || !Number.isFinite(probability)) {
      throw new ProviderError("TypeSafe returned a malformed answer.");
    }
    return { postId: item.postId, ruleId: rule.id, matched: probability >= MATCH_THRESHOLD };
  });
}

/* System One evaluates one state per request, so each post gets its own request and retry budget */
export async function analyzePosts(apiKey: string, items: FeedItem[], rules: Rule[]): Promise<MatchResult[]> {
  const perPost = await Promise.all(items.map((item) => withRetries(() => requestPost(apiKey, item, rules))));
  return perPost.flat();
}
