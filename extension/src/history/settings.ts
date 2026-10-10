/* Stored history settings with safe defaults */
import { DEFAULT_STATE, HISTORY_RETENTION_DAYS } from "../core/constants";
import type { HistorySettings } from "../core/types";

export function loadHistorySettings(history: Partial<HistorySettings> | undefined): HistorySettings {
  const retentionDays = history?.retentionDays;
  return {
    enabled: typeof history?.enabled === "boolean" ? history.enabled : DEFAULT_STATE.history.enabled,
    retentionDays: retentionDays !== undefined && HISTORY_RETENTION_DAYS.includes(retentionDays)
      ? retentionDays
      : DEFAULT_STATE.history.retentionDays,
  };
}
