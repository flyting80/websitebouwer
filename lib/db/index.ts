/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

const url = process.env.DATABASE_URL;
const useLocal = !url || url === "local" || url.startsWith("file:");

let _db: any = null;

export function getDb(): any {
  if (_db) return _db;

  if (useLocal) {
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const schema = require("./schema-sqlite");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "local.db");
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    const { migrateLocalSqlite } = require("./migrate-local");
    migrateLocalSqlite(sqlite);
    _db = drizzle(sqlite, { schema });
  } else {
    const { neon } = require("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-http");
    const schema = require("./schema");
    _db = drizzle(neon(url), { schema });
  }

  return _db;
}

// Proxy so `db.select()` etc. works everywhere without calling getDb()
// eslint-disable-next-line prefer-const
export let db: any = new Proxy({} as any, {
  get(_target, prop) {
    return getDb()[prop];
  },
});

export * from "./schema-sqlite";
