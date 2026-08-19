/**
 * Initialiseert de lokale SQLite-database met alle tabellen.
 * Gebruik: npx tsx scripts/setup-local-db.ts
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT,
    contact_email TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS site_themes (
    site_id TEXT PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
    color_primary TEXT NOT NULL DEFAULT '#d97706',
    color_secondary TEXT NOT NULL DEFAULT '#92400e',
    color_accent TEXT NOT NULL DEFAULT '#fbbf24',
    color_background TEXT NOT NULL DEFAULT '#fffbf0',
    color_surface TEXT NOT NULL DEFAULT '#ffffff',
    color_text TEXT NOT NULL DEFAULT '#1c1917',
    color_text_muted TEXT NOT NULL DEFAULT '#78716c',
    font_heading TEXT NOT NULL DEFAULT 'Playfair Display',
    font_body TEXT NOT NULL DEFAULT 'Inter',
    logo_url TEXT,
    border_radius TEXT NOT NULL DEFAULT '0.5rem',
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    site_id TEXT PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
    plausible_domain TEXT,
    cookie_banner_enabled INTEGER NOT NULL DEFAULT 1,
    footer_text TEXT,
    social_facebook TEXT,
    social_instagram TEXT,
    social_linkedin TEXT,
    header_enabled INTEGER NOT NULL DEFAULT 1,
    header_sticky INTEGER NOT NULL DEFAULT 1,
    header_desktop_layout TEXT,
    header_mobile_layout TEXT,
    header_mobile_style TEXT NOT NULL DEFAULT 'drawer',
    header_position TEXT NOT NULL DEFAULT 'top',
    header_tagline TEXT,
    header_extra_image_url TEXT,
    header_style TEXT,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_verified TEXT,
    name TEXT,
    image TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS accounts (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (provider, provider_account_id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    session_token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TEXT NOT NULL,
    PRIMARY KEY (identifier, token)
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    page_type TEXT NOT NULL DEFAULT 'page',
    draft_blocks TEXT NOT NULL DEFAULT '[]',
    live_blocks TEXT NOT NULL DEFAULT '[]',
    draft_blocks_mobile TEXT NOT NULL DEFAULT '[]',
    live_blocks_mobile TEXT NOT NULL DEFAULT '[]',
    seo_title TEXT,
    seo_description TEXT,
    seo_image TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    show_in_nav INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS pages_site_slug_idx ON pages(site_id, slug);

  CREATE TABLE IF NOT EXISTS media_folders (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS media_folders_site_idx ON media_folders(site_id);

  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    folder_id TEXT REFERENCES media_folders(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    alt TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS media_site_idx ON media(site_id);

  CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    content TEXT NOT NULL DEFAULT '[]',
    author_name TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS blog_site_slug_idx ON blog_posts(site_id, slug);

  CREATE TABLE IF NOT EXISTS podcast_episodes (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    cover_image_url TEXT,
    duration_seconds INTEGER,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS podcast_site_slug_idx ON podcast_episodes(site_id, slug);

  CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blog_post_categories (
    post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS contact_site_idx ON contact_submissions(site_id);

  CREATE TABLE IF NOT EXISTS nav_items (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    open_in_new_tab INTEGER NOT NULL DEFAULT 0,
    parent_id TEXT,
    placement TEXT NOT NULL DEFAULT 'header',
    visibility TEXT NOT NULL DEFAULT 'both'
  );

  CREATE INDEX IF NOT EXISTS nav_site_idx ON nav_items(site_id);
`);

console.log("✅ Database aangemaakt:", dbPath);
db.close();
