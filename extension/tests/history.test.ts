import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import type { FeedItem, MatchResult, Rule } from "../src/core/types";
import { clearRecords, listRecords, pruneRecords, saveRecords } from "../src/history/db";
import { ALL_FILTERS, filterRecords, summarize } from "../src/history/filter";
import { buildHistoryRecords, type HistoryRecord } from "../src/history/record";
import { loadHistorySettings } from "../src/history/settings";

const DAY_MS = 86_400_000;
const rules: Rule[] = [
  { id: "jobs", name: "Jobs", criterion: "Job listing", enabled: true, color: "#3b82f6", action: "mark" },
  { id: "rage", name: "Rage", criterion: "Rage bait", enabled: true, color: "#ef4444", action: "remove" },
];
const items: FeedItem[] = [
  { site: "reddit", postId: "t3_abc123", subreddit: "forhire", title: "Hiring a designer", body: "Private details" },
  { site: "youtube", postId: "dQw4w9WgXcQ", channel: "Rick", title: "Short clip", description: "Long description", isShort: true },
  { site: "reddit", postId: "local-x1", subreddit: "news", title: "No ID", body: "" },
];
const results: MatchResult[] = [
  { postId: "t3_abc123", ruleId: "jobs", matched: true, reason: "Hiring post." },
  { postId: "t3_abc123", ruleId: "rage", matched: true },
  { postId: "dQw4w9WgXcQ", ruleId: "jobs", matched: false },
];

function record(id: string, lastAnalyzed: number): HistoryRecord {
  return { id, site: "reddit", postId: id, title: id, source: "r/test", matches: [], action: "none", provider: "groq", firstSeen: lastAnalyzed, lastAnalyzed };
}

describe("history records", () => {
  const [reddit, short, local] = buildHistoryRecords(items, results, rules, "groq", 1_000);

  it("builds links locally and stores no post body", () => {
    expect(reddit?.url).toBe("https://www.reddit.com/comments/abc123/");
    expect(short?.url).toBe("https://www.youtube.com/shorts/dQw4w9WgXcQ");
    expect(local?.url).toBeUndefined();
    expect(JSON.stringify([reddit, short])).not.toMatch(/Private details|Long description/);
  });

  it("keeps only the start of an X post and no author", () => {
    const text = `${"Long post ".repeat(20)}secret tail`;
    const [xPost] = buildHistoryRecords([{ site: "x", postId: "1840000000000000001", text, quote: "Quoted text" }], [], rules, "groq", 1_000);
    expect(xPost?.url).toBe("https://x.com/i/status/1840000000000000001");
    expect(xPost?.title).toHaveLength(140);
    expect(xPost?.source).toBe("");
    expect(JSON.stringify(xPost)).not.toMatch(/secret tail|Quoted text/);
  });

  it("copies matching rules and applies the strongest action", () => {
    expect(reddit?.source).toBe("r/forhire");
    expect(reddit?.matches.map((match) => match.ruleName)).toEqual(["Jobs", "Rage"]);
    expect(reddit?.matches[0]?.reason).toBe("Hiring post.");
    expect(reddit?.action).toBe("remove");
    expect(short?.action).toBe("none");
  });
});

describe("history database", () => {
  beforeEach(() => clearRecords());

  it("keeps the first seen time when a post is analyzed again", async () => {
    await saveRecords([record("a", 1_000)]);
    await saveRecords([{ ...record("a", 5_000), title: "updated" }]);
    const [saved] = await listRecords();
    expect(saved).toMatchObject({ title: "updated", firstSeen: 1_000, lastAnalyzed: 5_000 });
  });

  it("lists newest first and prunes by age, then by count", async () => {
    const now = 10 * DAY_MS;
    await saveRecords([record("old", now - 8 * DAY_MS), record("b", now - 3), record("c", now - 2), record("d", now - 1)]);
    expect((await listRecords()).map((saved) => saved.id)).toEqual(["d", "c", "b", "old"]);
    await pruneRecords(7, 2, now);
    expect((await listRecords()).map((saved) => saved.id)).toEqual(["d", "c"]);
  });
});

describe("history filters", () => {
  const records = buildHistoryRecords(items, results, rules, "groq", 1_000);

  it("filters by site, action, rule, and text", () => {
    expect(filterRecords(records, { ...ALL_FILTERS, site: "youtube" })).toHaveLength(1);
    expect(filterRecords(records, { ...ALL_FILTERS, action: "none" })).toHaveLength(2);
    expect(filterRecords(records, { ...ALL_FILTERS, ruleId: "rage" }).map((saved) => saved.postId)).toEqual(["t3_abc123"]);
    expect(filterRecords(records, { ...ALL_FILTERS, query: "FORHIRE" })).toHaveLength(1);
  });

  it("summarizes counts per action and rule", () => {
    expect(summarize(records)).toMatchObject({ analyzed: 3, matched: 1, hidden: 0, removed: 1 });
    expect(summarize(records).rules.map((rule) => [rule.ruleName, rule.count])).toEqual([["Jobs", 1], ["Rage", 1]]);
  });
});

describe("history settings", () => {
  it("defaults missing or invalid stored values", () => {
    expect(loadHistorySettings(undefined)).toEqual({ enabled: true, retentionDays: 7 });
    expect(loadHistorySettings({ enabled: false, retentionDays: 999 })).toEqual({ enabled: false, retentionDays: 7 });
    expect(loadHistorySettings({ enabled: false, retentionDays: 30 })).toEqual({ enabled: false, retentionDays: 30 });
  });
});
