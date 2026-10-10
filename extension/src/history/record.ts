/* History records built from one analysis batch */
import { strongestAction } from "../core/rules";
import type { FeedItem, MatchResult, ProviderKind, Rule, RuleAction, RuleColor } from "../core/types";
import { redditPostUrl } from "../reddit/link";
import { youtubeVideoUrl } from "../youtube/link";

export interface HistoryMatch {
  ruleId: string;
  ruleName: string;
  ruleColor: RuleColor;
  action: RuleAction;
  reason?: string;
}

export interface HistoryRecord {
  id: string;
  site: FeedItem["site"];
  postId: string;
  title: string;
  source: string;
  url?: string;
  /* Rule details are copied so that a renamed or deleted rule does not change old records */
  matches: HistoryMatch[];
  action: RuleAction | "none";
  provider: ProviderKind;
  firstSeen: number;
  lastAnalyzed: number;
}

export function historyId(item: FeedItem): string {
  return `${item.site}:${item.postId}`;
}

function source(item: FeedItem): string {
  return item.site === "reddit" ? `r/${item.subreddit}` : item.channel;
}

function itemUrl(item: FeedItem): string | undefined {
  return item.site === "reddit" ? redditPostUrl(item) : youtubeVideoUrl(item);
}

/* Records keep the title, source, and link only. Post bodies and video descriptions stay out of storage. */
export function buildHistoryRecords(
  items: FeedItem[],
  results: MatchResult[],
  rules: Rule[],
  provider: ProviderKind,
  now: number,
): HistoryRecord[] {
  return items.map((item) => {
    const matches = rules.flatMap((rule): HistoryMatch[] => {
      const result = results.find((candidate) => candidate.postId === item.postId && candidate.ruleId === rule.id);
      if (!result?.matched) return [];
      return [{
        ruleId: rule.id,
        ruleName: rule.name,
        ruleColor: rule.color,
        action: rule.action,
        ...(result.reason ? { reason: result.reason } : {}),
      }];
    });
    const url = itemUrl(item);
    return {
      id: historyId(item),
      site: item.site,
      postId: item.postId,
      title: item.title,
      source: source(item),
      ...(url ? { url } : {}),
      matches,
      action: matches.length ? strongestAction(matches.map((match) => match.action)) : "none",
      provider,
      firstSeen: now,
      lastAnalyzed: now,
    };
  });
}
