/* Dashboard filters and summary counts over history records */
import type { RuleAction, RuleColor } from "../core/types";
import type { HistoryRecord } from "./record";

export interface HistoryFilters {
  site: HistoryRecord["site"] | "all";
  ruleId: string;
  action: RuleAction | "none" | "all";
  query: string;
}

export interface RuleSummary {
  ruleId: string;
  ruleName: string;
  ruleColor: RuleColor;
  count: number;
}

export interface HistorySummary {
  analyzed: number;
  matched: number;
  hidden: number;
  removed: number;
  rules: RuleSummary[];
}

export const ALL_FILTERS: HistoryFilters = { site: "all", ruleId: "all", action: "all", query: "" };

export function filterRecords(records: HistoryRecord[], filters: HistoryFilters): HistoryRecord[] {
  const query = filters.query.trim().toLowerCase();
  return records.filter((record) =>
    (filters.site === "all" || record.site === filters.site) &&
    (filters.action === "all" || record.action === filters.action) &&
    (filters.ruleId === "all" || record.matches.some((match) => match.ruleId === filters.ruleId)) &&
    (!query || record.title.toLowerCase().includes(query) || record.source.toLowerCase().includes(query)));
}

/* Records are newest first, so the first name seen for a rule is its latest name */
export function summarize(records: HistoryRecord[]): HistorySummary {
  const rules = new Map<string, RuleSummary>();
  for (const record of records) {
    for (const match of record.matches) {
      const summary = rules.get(match.ruleId);
      if (summary) summary.count += 1;
      else rules.set(match.ruleId, { ruleId: match.ruleId, ruleName: match.ruleName, ruleColor: match.ruleColor, count: 1 });
    }
  }
  return {
    analyzed: records.length,
    matched: records.filter((record) => record.action !== "none").length,
    hidden: records.filter((record) => record.action === "hide").length,
    removed: records.filter((record) => record.action === "remove").length,
    rules: [...rules.values()].sort((a, b) => b.count - a.count),
  };
}
