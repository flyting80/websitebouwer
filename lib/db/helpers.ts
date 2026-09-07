/**
 * SQLite-compatible insert helper.
 * Drizzle's SQLite adapter supports .returning() but the result must be awaited.
 * This helper ensures we always get the inserted row back.
 */

export function newId(): string {
  return crypto.randomUUID();
}

/**
 * Timestamp for inserts/updates.
 * Always a Date — Postgres timestamp columns require it, and SQLite text columns
 * accept Date (drizzle serializes). Never use toISOString() here: on Vercel
 * DATABASE_URL may be the literal "local" while POSTGRES_* is the real URL, so
 * dialect detection via DATABASE_URL alone was wrong and caused:
 * TypeError: e.toISOString is not a function
 */
export function dbNow(): Date {
  return new Date();
}
