/**
 * SQLite-compatible insert helper.
 * Drizzle's SQLite adapter supports .returning() but the result must be awaited.
 * This helper ensures we always get the inserted row back.
 */

export function newId(): string {
  return crypto.randomUUID();
}
