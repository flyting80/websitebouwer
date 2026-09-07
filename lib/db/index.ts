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

function activeSchema(): any {
  // Must match getDb() dialect: sqlite JSON columns JSON.parse strings;
  // postgres jsonb already returns objects — using sqlite table defs on postgres
  // caused: Unexpected token 'o', "[object Obj"... is not valid JSON
  return resolveMode() === "postgres" ? require("./schema") : require("./schema-sqlite");
}

function bindTable(name: string): any {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const table = activeSchema()[name];
        const value = table[prop];
        return typeof value === "function" ? value.bind(table) : value;
      },
      ownKeys() {
        return Reflect.ownKeys(activeSchema()[name]);
      },
      getOwnPropertyDescriptor(_target, prop) {
        return Object.getOwnPropertyDescriptor(activeSchema()[name], prop);
      },
      has(_target, prop) {
        return prop in activeSchema()[name];
      },
      getPrototypeOf() {
        return Object.getPrototypeOf(activeSchema()[name]);
      },
    }
  );
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

// Runtime-bound tables (sqlite locally, postgres on Vercel)
export const sites = bindTable("sites");
export const siteThemes = bindTable("siteThemes");
export const users = bindTable("users");
export const sessions = bindTable("sessions");
export const verificationTokens = bindTable("verificationTokens");
export const accounts = bindTable("accounts");
export const pages = bindTable("pages");
export const mediaFolders = bindTable("mediaFolders");
export const media = bindTable("media");
export const podcastEpisodes = bindTable("podcastEpisodes");
export const blogPosts = bindTable("blogPosts");
export const blogCategories = bindTable("blogCategories");
export const blogPostCategories = bindTable("blogPostCategories");
export const contactSubmissions = bindTable("contactSubmissions");
export const navItems = bindTable("navItems");
export const siteSettings = bindTable("siteSettings");

export type {
  Site,
  Page,
  MediaFolder,
  Media,
  PodcastEpisode,
  BlogPost,
  BlogCategory,
  ContactSubmission,
  NavItem,
  SiteTheme,
  SiteSettings,
} from "./schema-sqlite";
