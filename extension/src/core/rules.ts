import { MAX_RULES, RULE_COLORS } from "./constants";
import type { Rule, RuleColor } from "./types";

export function createRule(index: number): Rule {
  return {
    id: crypto.randomUUID(),
    name: "New rule",
    criterion: "",
    enabled: true,
    color: RULE_COLORS[index % RULE_COLORS.length] ?? "#3b82f6",
  };
}

export function sanitizeRules(value: unknown): Rule[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_RULES).flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const rule = candidate as Partial<Rule>;
    if (typeof rule.id !== "string" || typeof rule.name !== "string") return [];
    if (typeof rule.criterion !== "string" || typeof rule.enabled !== "boolean") return [];
    if (!RULE_COLORS.includes(rule.color as RuleColor)) return [];

    return [{
      id: rule.id,
      name: rule.name.trim().slice(0, 40),
      criterion: rule.criterion.trim().slice(0, 500),
      enabled: rule.enabled,
      color: rule.color as RuleColor,
    }];
  });
}

export function moveRule(rules: Rule[], index: number, direction: -1 | 1): Rule[] {
  const target = index + direction;
  if (target < 0 || target >= rules.length) return rules;
  const next = [...rules];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}

export function analysisFingerprint(rules: Rule[]): string {
  return rules
    .filter((rule) => rule.enabled && rule.criterion)
    .map(({ id, criterion }) => `${id}:${criterion}`)
    .join("|");
}
