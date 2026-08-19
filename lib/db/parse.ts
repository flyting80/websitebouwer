/**
 * SQLite stores JSON columns as strings; Postgres returns actual objects.
 * Use these helpers to safely parse any JSON column.
 */

export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

export function parseBlocks(value: unknown): object[] {
  return parseJsonField<object[]>(value, []);
}
