import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

function now() {
  return sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;
}
function randomUUID() {
  return sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`;
}

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  contactEmail: text("contact_email"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const siteThemes = sqliteTable("site_themes", {
  siteId: text("site_id").references(() => sites.id, { onDelete: "cascade" }).primaryKey(),
  colorPrimary: text("color_primary").notNull().default("#d97706"),
  colorSecondary: text("color_secondary").notNull().default("#92400e"),
  colorAccent: text("color_accent").notNull().default("#fbbf24"),
  colorBackground: text("color_background").notNull().default("#fffbf0"),
  colorSurface: text("color_surface").notNull().default("#ffffff"),
  colorText: text("color_text").notNull().default("#1c1917"),
  colorTextMuted: text("color_text_muted").notNull().default("#78716c"),
  fontHeading: text("font_heading").notNull().default("Playfair Display"),
  fontBody: text("font_body").notNull().default("Inter"),
  logoUrl: text("logo_url"),
  borderRadius: text("border_radius").notNull().default("0.5rem"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  emailVerified: text("email_verified"),
  name: text("name"),
  image: text("image"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: text("expires").notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: text("expires").notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => [primaryKey({ columns: [a.provider, a.providerAccountId] })]
);

export const pages = sqliteTable(
  "pages",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    pageType: text("page_type").notNull().default("page"),
    draftBlocks: text("draft_blocks", { mode: "json" }).notNull().default("[]"),
    liveBlocks: text("live_blocks", { mode: "json" }).notNull().default("[]"),
    draftBlocksMobile: text("draft_blocks_mobile", { mode: "json" }).notNull().default("[]"),
    liveBlocksMobile: text("live_blocks_mobile", { mode: "json" }).notNull().default("[]"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoImage: text("seo_image"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    publishedAt: text("published_at"),
    sortOrder: integer("sort_order").notNull().default(0),
    showInNav: integer("show_in_nav", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  },
  (p) => [uniqueIndex("pages_site_slug_idx").on(p.siteId, p.slug)]
);

export const mediaFolders = sqliteTable(
  "media_folders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  },
  (f) => [index("media_folders_site_idx").on(f.siteId)]
);

export const media = sqliteTable(
  "media",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    folderId: text("folder_id").references(() => mediaFolders.id, { onDelete: "set null" }),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    url: text("url").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: text("alt").notNull().default(""),
    storageKey: text("storage_key"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  },
  (m) => [index("media_site_idx").on(m.siteId)]
);

export const podcastEpisodes = sqliteTable(
  "podcast_episodes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    audioUrl: text("audio_url"),
    coverImageUrl: text("cover_image_url"),
    durationSeconds: integer("duration_seconds"),
    status: text("status").notNull().default("draft"),
    publishedAt: text("published_at"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  },
  (p) => [uniqueIndex("podcast_site_slug_idx").on(p.siteId, p.slug)]
);

export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    coverImageUrl: text("cover_image_url"),
    content: text("content", { mode: "json" }).notNull().default("[]"),
    authorName: text("author_name"),
    status: text("status").notNull().default("draft"),
    publishedAt: text("published_at"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  },
  (b) => [uniqueIndex("blog_site_slug_idx").on(b.siteId, b.slug)]
);

export const blogCategories = sqliteTable(
  "blog_categories",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (c) => [index("blog_cat_site_idx").on(c.siteId), uniqueIndex("blog_cat_site_slug_idx").on(c.siteId, c.slug)]
);

export const blogPostCategories = sqliteTable(
  "blog_post_categories",
  {
    postId: text("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
    categoryId: text("category_id").notNull().references(() => blogCategories.id, { onDelete: "cascade" }),
  },
  (bpc) => [primaryKey({ columns: [bpc.postId, bpc.categoryId] })]
);

export const contactSubmissions = sqliteTable(
  "contact_submissions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  },
  (c) => [index("contact_site_idx").on(c.siteId)]
);

export const navItems = sqliteTable(
  "nav_items",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    href: text("href").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    openInNewTab: integer("open_in_new_tab", { mode: "boolean" }).notNull().default(false),
    parentId: text("parent_id"),
    placement: text("placement").notNull().default("header"),
    visibility: text("visibility").notNull().default("both"),
  },
  (n) => [index("nav_site_idx").on(n.siteId)]
);

export const siteSettings = sqliteTable("site_settings", {
  siteId: text("site_id").references(() => sites.id, { onDelete: "cascade" }).primaryKey(),
  plausibleDomain: text("plausible_domain"),
  cookieBannerEnabled: integer("cookie_banner_enabled", { mode: "boolean" }).notNull().default(true),
  footerText: text("footer_text"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialLinkedin: text("social_linkedin"),
  headerEnabled: integer("header_enabled", { mode: "boolean" }).notNull().default(true),
  headerSticky: integer("header_sticky", { mode: "boolean" }).notNull().default(true),
  headerDesktopLayout: text("header_desktop_layout"),
  headerMobileLayout: text("header_mobile_layout"),
  headerMobileStyle: text("header_mobile_style").notNull().default("drawer"),
  headerPosition: text("header_position").notNull().default("top"),
  headerTagline: text("header_tagline"),
  headerExtraImageUrl: text("header_extra_image_url"),
  headerStyle: text("header_style"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Re-export types compatible with original schema
export type Site = typeof sites.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type MediaFolder = typeof mediaFolders.$inferSelect;
export type Media = typeof media.$inferSelect;
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NavItem = typeof navItems.$inferSelect;
export type SiteTheme = typeof siteThemes.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
