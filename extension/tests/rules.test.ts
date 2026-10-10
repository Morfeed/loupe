import { describe, expect, it } from "vitest";
import { analysisFingerprint, moveRule, sanitizeRules } from "../src/core/rules";
import type { Rule } from "../src/core/types";

const rules: Rule[] = [
  { id: "one", name: "Jobs", criterion: "A job listing", enabled: true, color: "#3b82f6", action: "mark" },
  { id: "two", name: "Noise", criterion: "Rage bait", enabled: false, color: "#ef4444", action: "mark" },
];

describe("rules", () => {
  it("fingerprints only analysis-affecting enabled rules", () => {
    expect(analysisFingerprint(rules)).toBe("one:A job listing");
    expect(analysisFingerprint([{ ...rules[0]!, color: "#22c55e" }])).toBe("one:A job listing");
  });

  it("moves rules without mutating the source", () => {
    const moved = moveRule(rules, 0, 1);
    expect(moved.map((rule) => rule.id)).toEqual(["two", "one"]);
    expect(rules.map((rule) => rule.id)).toEqual(["one", "two"]);
  });

  it("drops malformed stored rules", () => {
    expect(sanitizeRules([...rules, { id: 2 }])).toEqual(rules);
  });

  it("defaults a missing or unknown action to mark", () => {
    const { action: _action, ...legacy } = rules[0]!;
    expect(sanitizeRules([legacy, { ...rules[1]!, action: "explode" }]).map((rule) => rule.action)).toEqual(["mark", "mark"]);
  });

  it("ignores action changes when fingerprinting", () => {
    expect(analysisFingerprint([{ ...rules[0]!, action: "remove" }])).toBe("one:A job listing");
  });
});
