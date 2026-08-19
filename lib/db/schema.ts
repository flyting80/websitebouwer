import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Sites ───────────────────────────────────────────────────────────────────
export const sites = pgTable("sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"), // custom domain, nullable
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Theme ───────────────────────────────────────────────────────────────────
export const siteThemes = pgTable("site_themes", {
  siteId: uuid("site_id")
    .references(() => sites.id, { onDelete: "cascade" })
    .primaryKey(),
  colorPrimary: text("color_primary").default("#d97706").notNull(),
  colorSecondary: text("color_secondary").default("#92400e").notNull(),
  colorAccent: text("color_accent").default("#fbbf24").notNull(),
  colorBackground: text("color_background").default("#fffbf0").notNull(),
  colorSurface: text("color_surface").default("#ffffff").notNull(),
  colorText: text("color_text").default("#1c1917").notNull(),
  colorTextMuted: text("color_text_muted").default("#78716c").notNull(),
  fontHeading: text("font_heading").default("Playfair Display").notNull(),
  fontBody: text("font_body").default("Inter").notNull(),
  logoUrl: text("logo_url"),
  borderRadius: text("border_radius").default("0.5rem").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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

// ─── Pages ───────────────────────────────────────────────────────────────────
export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(), // unique within site
    pageType: text("page_type").default("page").notNull(), // page | legal | home
    draftBlocks: jsonb("draft_blocks").default([]).notNull(),
    liveBlocks: jsonb("live_blocks").default([]).notNull(),
    draftBlocksMobile: jsonb("draft_blocks_mobile").default([]).notNull(),
    liveBlocksMobile: jsonb("live_blocks_mobile").default([]).notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoImage: text("seo_image"),
    isPublished: boolean("is_published").default(false).notNull(),
    publishedAt: timestamp("published_at"),
    sortOrder: integer("sort_order").default(0).notNull(),
    showInNav: boolean("show_in_nav").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (p) => [uniqueIndex("pages_site_slug_idx").on(p.siteId, p.slug)]
);

// ─── Media folders ───────────────────────────────────────────────────────────
export const mediaFolders = pgTable(
  "media_folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (f) => [index("media_folders_site_idx").on(f.siteId)]
);

// ─── Media ───────────────────────────────────────────────────────────────────
export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id").references(() => mediaFolders.id, { onDelete: "set null" }),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    url: text("url").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(), // bytes
    width: integer("width"),
    height: integer("height"),
    alt: text("alt").default("").notNull(),
    storageKey: text("storage_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (m) => [index("media_site_idx").on(m.siteId)]
);

export const podcastEpisodes = pgTable(
  "podcast_episodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    audioUrl: text("audio_url"),
    coverImageUrl: text("cover_image_url"),
    durationSeconds: integer("duration_seconds"),
    status: text("status").default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (p) => [uniqueIndex("podcast_site_slug_idx").on(p.siteId, p.slug)]
);

// ─── Blog Posts ──────────────────────────────────────────────────────────────
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    coverImageUrl: text("cover_image_url"),
    content: jsonb("content").default([]).notNull(), // blokken net als pages
    authorName: text("author_name"),
    status: text("status").default("draft").notNull(), // draft | published
    publishedAt: timestamp("published_at"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (b) => [uniqueIndex("blog_site_slug_idx").on(b.siteId, b.slug)]
);

export const blogCategories = pgTable(
  "blog_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (c) => [index("blog_cat_site_idx").on(c.siteId), uniqueIndex("blog_cat_site_slug_idx").on(c.siteId, c.slug)]
);

export const blogPostCategories = pgTable(
  "blog_post_categories",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => blogCategories.id, { onDelete: "cascade" }),
  },
  (bpc) => [primaryKey({ columns: [bpc.postId, bpc.categoryId] })]
);

// ─── Contact submissions ──────────────────────────────────────────────────────
export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (c) => [index("contact_site_idx").on(c.siteId)]
);

// ─── Nav ─────────────────────────────────────────────────────────────────────
export const navItems = pgTable(
  "nav_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    href: text("href").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    openInNewTab: boolean("open_in_new_tab").default(false).notNull(),
    parentId: uuid("parent_id"),
    placement: text("placement").default("header").notNull(),
    visibility: text("visibility").default("both").notNull(),
  },
  (n) => [index("nav_site_idx").on(n.siteId)]
);

// ─── Site settings (misc key/value) ──────────────────────────────────────────
export const siteSettings = pgTable("site_settings", {
  siteId: uuid("site_id")
    .references(() => sites.id, { onDelete: "cascade" })
    .primaryKey(),
  plausibleDomain: text("plausible_domain"),
  cookieBannerEnabled: boolean("cookie_banner_enabled").default(true).notNull(),
  footerText: text("footer_text"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialLinkedin: text("social_linkedin"),
  headerEnabled: boolean("header_enabled").default(true).notNull(),
  headerSticky: boolean("header_sticky").default(true).notNull(),
  headerDesktopLayout: text("header_desktop_layout"),
  headerMobileLayout: text("header_mobile_layout"),
  headerMobileStyle: text("header_mobile_style").default("drawer").notNull(),
  headerPosition: text("header_position").default("top").notNull(),
  headerTagline: text("header_tagline"),
  headerExtraImageUrl: text("header_extra_image_url"),
  headerStyle: text("header_style"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
