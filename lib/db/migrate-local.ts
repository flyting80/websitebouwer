export function migrateLocalSqlite(sqlite: {
  prepare: (sql: string) => { all: () => { name: string }[] };
  exec: (sql: string) => void;
}) {
  const navCols = sqlite.prepare("PRAGMA table_info(nav_items)").all() as { name: string }[];
  const navNames = new Set(navCols.map((c) => c.name));

  if (!navNames.has("parent_id")) {
    sqlite.exec("ALTER TABLE nav_items ADD COLUMN parent_id TEXT");
  }
  if (!navNames.has("placement")) {
    sqlite.exec("ALTER TABLE nav_items ADD COLUMN placement TEXT NOT NULL DEFAULT 'both'");
  }
  if (!navNames.has("visibility")) {
    sqlite.exec("ALTER TABLE nav_items ADD COLUMN visibility TEXT NOT NULL DEFAULT 'both'");
  }

  const settingsCols = sqlite.prepare("PRAGMA table_info(site_settings)").all() as { name: string }[];
  const settingsNames = new Set(settingsCols.map((c) => c.name));
  if (!settingsNames.has("header_enabled")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_enabled INTEGER NOT NULL DEFAULT 1");
  }
  if (!settingsNames.has("header_sticky")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_sticky INTEGER NOT NULL DEFAULT 1");
  }
  if (!settingsNames.has("header_desktop_layout")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_desktop_layout TEXT");
  }
  if (!settingsNames.has("header_mobile_layout")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_mobile_layout TEXT");
  }
  if (!settingsNames.has("header_mobile_style")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_mobile_style TEXT NOT NULL DEFAULT 'drawer'");
  }
  if (!settingsNames.has("header_position")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_position TEXT NOT NULL DEFAULT 'top'");
  }
  if (!settingsNames.has("header_tagline")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_tagline TEXT");
  }
  if (!settingsNames.has("header_extra_image_url")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_extra_image_url TEXT");
  }
  if (!settingsNames.has("header_style")) {
    sqlite.exec("ALTER TABLE site_settings ADD COLUMN header_style TEXT");
  }

  const pageCols = sqlite.prepare("PRAGMA table_info(pages)").all() as { name: string }[];
  const pageNames = new Set(pageCols.map((c) => c.name));
  if (!pageNames.has("draft_blocks_mobile")) {
    sqlite.exec("ALTER TABLE pages ADD COLUMN draft_blocks_mobile TEXT NOT NULL DEFAULT '[]'");
  }
  if (!pageNames.has("live_blocks_mobile")) {
    sqlite.exec("ALTER TABLE pages ADD COLUMN live_blocks_mobile TEXT NOT NULL DEFAULT '[]'");
  }

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS media_folders (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      parent_id TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    CREATE INDEX IF NOT EXISTS media_folders_site_idx ON media_folders(site_id);
  `);

  const mediaCols = sqlite.prepare("PRAGMA table_info(media)").all() as { name: string }[];
  const mediaNames = new Set(mediaCols.map((c) => c.name));
  if (!mediaNames.has("folder_id")) {
    sqlite.exec("ALTER TABLE media ADD COLUMN folder_id TEXT REFERENCES media_folders(id) ON DELETE SET NULL");
  }
  if (!mediaNames.has("storage_key")) {
    sqlite.exec("ALTER TABLE media ADD COLUMN storage_key TEXT");
  }

  sqlite.exec(`
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
  `);
}
