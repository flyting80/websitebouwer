/**
 * SQLite-compatible insert helper.
 * Drizzle's SQLite adapter supports .returning() but the result must be awaited.
 * This helper ensures we always get the inserted row back.
 */

export function newId(): string {
  return crypto.randomUUID();
}

/** Timestamp value for the active DB dialect (Date for Postgres, ISO string for SQLite). */
export function dbNow(): Date | string {
  const url = (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    ""
  ).trim();
  const postgres = Boolean(url && url !== "local" && !url.startsWith("file:"));
  return postgres ? new Date() : new Date().toISOString();
}
