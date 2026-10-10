/* Provider dispatch by the kind the user selects in settings */
import type { FeedItem, MatchResult, ProviderKind, ProviderSettings, Rule } from "../core/types";
import * as groq from "./groq";
import * as typesafe from "./typesafe";

type Analyze = (apiKey: string, items: FeedItem[], rules: Rule[]) => Promise<MatchResult[]>;

const analyzers: Record<ProviderKind, Analyze> = {
  groq: groq.analyzePosts,
  typesafe: typesafe.analyzePosts,
};

export function analyzePosts(provider: ProviderSettings, items: FeedItem[], rules: Rule[]): Promise<MatchResult[]> {
  return analyzers[provider.kind](provider.apiKey.trim(), items, rules);
}

export async function testProvider(provider: ProviderSettings): Promise<void> {
  await analyzePosts(
    provider,
    [{ site: "reddit", postId: "connection-test", subreddit: "loupe", title: "Loupe connection test", body: "" }],
    [{ id: "connection-rule", name: "Connection", criterion: "Match this connection test", enabled: true, color: "#3b82f6", action: "mark" }],
  );
}
