import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzePosts } from "../src/provider";
import { parseResults, providerEndpoint } from "../src/provider/groq";
import { providerEndpoint as typesafeEndpoint } from "../src/provider/typesafe";
import type { FeedItem, Rule } from "../src/core/types";

const items: FeedItem[] = [{ site: "reddit", postId: "post", subreddit: "jobs", title: "Hiring", body: "React role" }];
const rules: Rule[] = [{ id: "rule", name: "Jobs", criterion: "Job listings", enabled: true, color: "#3b82f6", action: "mark" }];

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

describe("TypeSafe provider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const twoRules: Rule[] = [...rules, { id: "rule-2", name: "Memes", criterion: "Image memes", enabled: true, color: "#ef4444", action: "mark" }];
  const twoItems: FeedItem[] = [...items, { site: "reddit", postId: "post-2", subreddit: "cats", title: "Cat pic", body: "" }];

  function answered(nouls: number[]) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ answers: Object.fromEntries(nouls.map((noul, index) => [`rule_${index}`, { type: "noul", noul }])) }),
    };
  }

  it("sends one Noul question per rule for each post", async () => {
    const fetchMock = vi.fn().mockResolvedValue(answered([0.9, 0.1]));
    vi.stubGlobal("fetch", fetchMock);

    await analyzePosts({ kind: "typesafe", apiKey: " ts_test ", verified: true }, twoItems, twoRules);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(typesafeEndpoint());
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.headers).toMatchObject({ Authorization: "Bearer ts_test" });
    const body = JSON.parse(request.body as string);
    expect(body).toMatchObject({
      model: "jev-latest",
      state: { site: "reddit", subreddit: "jobs", title: "Hiring", body: "React role" },
    });
    expect(body.state).not.toHaveProperty("postId");
    expect(Object.keys(body.questions)).toEqual(["rule_0", "rule_1"]);
    expect(body.questions.rule_0).toMatchObject({ type: "noul" });
    expect(body.questions.rule_0.instructions).toContain("Job listings");
  });

  it("maps Noul probabilities to matches at the threshold", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(answered([0.5, 0.49])));

    await expect(analyzePosts({ kind: "typesafe", apiKey: "k", verified: true }, items, twoRules)).resolves.toEqual([
      { postId: "post", ruleId: "rule", matched: true },
      { postId: "post", ruleId: "rule-2", matched: false },
    ]);
  });

  it("rejects answers without a numeric Noul", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ answers: {} }) }));

    await expect(analyzePosts({ kind: "typesafe", apiKey: "k", verified: true }, items, rules)).rejects.toThrow("malformed");
  });

  it("retries an overloaded response", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 529, json: async () => ({}) })
      .mockResolvedValueOnce(answered([0.8]));
    vi.stubGlobal("fetch", fetchMock);

    const pending = analyzePosts({ kind: "typesafe", apiKey: "k", verified: true }, items, rules);
    await vi.runAllTimersAsync();

    await expect(pending).resolves.toEqual([{ postId: "post", ruleId: "rule", matched: true }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("surfaces an unauthorized error without retrying", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: { error_type: "authentication_error", message: "Cannot authenticate with the server. Please check your API key and try again." } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzePosts({ kind: "typesafe", apiKey: "k", verified: true }, items, rules)).rejects.toThrow("TypeSafe: Cannot authenticate");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
