/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

let _db: any = null;
let _mode: "local" | "postgres" | null = null;

function getDatabaseUrl(): string {
  // Prefer explicit DATABASE_URL; fall back to Supabase↔Vercel integration vars
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ];
  for (const raw of candidates) {
    const url = (raw ?? "").trim();
    if (url && url !== "local" && !url.startsWith("file:")) return url;
  }
  // Keep last empty/local so diagnostics stay accurate
  return (process.env.DATABASE_URL ?? "").trim();
}

function resolveMode(): "local" | "postgres" {
  const url = getDatabaseUrl();
  if (!url || url === "local" || url.startsWith("file:")) return "local";
  return "postgres";
}

export function getDb(): any {
  // Always resolve from process.env at call-time (never bake mode at module load /
  // build time — that caused SQLite on Vercel when DATABASE_URL was only set at runtime).
  const mode = resolveMode();

  if (_db && _mode === mode) return _db;

  if (mode === "local") {
    if (process.env.VERCEL) {
      throw new Error(
        "[db] DATABASE_URL ontbreekt op Vercel of staat op 'local'. " +
          "Zet de Supabase Connection String (URI, Transaction pooler poort 6543) als DATABASE_URL en redeploy."
      );
    }
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
    const url = getDatabaseUrl();
    // postgres.js + prepare:false is required for Supabase transaction pooler (:6543)
    const postgres = require("postgres");
    const { drizzle } = require("drizzle-orm/postgres-js");
    const schema = require("./schema");
    const client = postgres(url, { prepare: false, max: 1 });
    _db = drizzle(client, { schema });
  }

  _mode = mode;
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
