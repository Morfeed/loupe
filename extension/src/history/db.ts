/* IndexedDB store for local analysis history */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { HISTORY_DB_NAME } from "../core/constants";
import type { HistoryRecord } from "./record";

const DAY_MS = 86_400_000;

interface HistorySchema extends DBSchema {
  records: {
    key: string;
    value: HistoryRecord;
    indexes: { lastAnalyzed: number };
  };
}

let connection: Promise<IDBPDatabase<HistorySchema>> | undefined;

/* The dashboard filters in memory. Only age-based pruning and ordering need an index. */
function openHistory(): Promise<IDBPDatabase<HistorySchema>> {
  connection ??= openDB<HistorySchema>(HISTORY_DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore("records", { keyPath: "id" }).createIndex("lastAnalyzed", "lastAnalyzed");
    },
    terminated() {
      connection = undefined;
    },
  }).catch((error: unknown) => {
    connection = undefined;
    throw error;
  });
  return connection;
}

export async function saveRecords(records: HistoryRecord[]): Promise<void> {
  const db = await openHistory();
  const tx = db.transaction("records", "readwrite");
  await Promise.all([
    ...records.map(async (record) => {
      const existing = await tx.store.get(record.id);
      await tx.store.put(existing ? { ...record, firstSeen: existing.firstSeen } : record);
    }),
    tx.done,
  ]);
}

export async function listRecords(): Promise<HistoryRecord[]> {
  const db = await openHistory();
  return (await db.getAllFromIndex("records", "lastAnalyzed")).reverse();
}

export async function clearRecords(): Promise<void> {
  const db = await openHistory();
  await db.clear("records");
}

export async function pruneRecords(retentionDays: number, maxRecords: number, now: number): Promise<void> {
  const db = await openHistory();
  const tx = db.transaction("records", "readwrite");
  const index = tx.store.index("lastAnalyzed");
  let cursor = await index.openCursor(IDBKeyRange.upperBound(now - retentionDays * DAY_MS, true));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  let excess = (await tx.store.count()) - maxRecords;
  cursor = excess > 0 ? await index.openCursor() : null;
  while (cursor && excess > 0) {
    await cursor.delete();
    excess -= 1;
    cursor = await cursor.continue();
  }
  await tx.done;
}
