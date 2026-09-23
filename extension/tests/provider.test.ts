import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzePosts, parseResults, providerEndpoint } from "../src/provider/groq";
import type { FeedItem, Rule } from "../src/core/types";

const items: FeedItem[] = [{ postId: "post", title: "Hiring", body: "React role", subreddit: "jobs" }];
const rules: Rule[] = [{ id: "rule", name: "Jobs", criterion: "Job listings", enabled: true, color: "#3b82f6" }];

describe("Groq provider", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the Groq OpenAI-compatible endpoint", () => {
    expect(providerEndpoint()).toBe("https://api.groq.com/openai/v1/chat/completions");
  });

  it("sends the Groq model and bearer key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ results: [{ postId: "post", ruleId: "rule", matched: false }] }) } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await analyzePosts({ kind: "groq", apiKey: "gsk_test", verified: true }, items, rules);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(providerEndpoint());
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.headers).toMatchObject({ Authorization: "Bearer gsk_test" });
    expect(JSON.parse(request.body as string)).toMatchObject({
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
      reasoning_effort: "low",
    });
  });

  it("accepts exactly one validated result per pair", () => {
    expect(parseResults(JSON.stringify({ results: [{ postId: "post", ruleId: "rule", matched: true, reason: "It advertises a role." }] }), items, rules)).toEqual([
      { postId: "post", ruleId: "rule", matched: true, reason: "It advertises a role." },
    ]);
  });

  it("rejects missing and unexpected results", () => {
    expect(() => parseResults('{"results":[]}', items, rules)).toThrow("omitted");
    expect(() => parseResults('{"results":[{"postId":"other","ruleId":"rule","matched":false}]}', items, rules)).toThrow("unexpected");
  });
});
