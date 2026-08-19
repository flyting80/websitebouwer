import { cache } from "react";
import { db } from "@/lib/db";
import { sites, siteThemes, navItems, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { themeRecord } from "@/lib/theme";
import type { Site, SiteTheme, NavItem, SiteSettings } from "@/lib/db";

export interface SiteChrome {
  site: Site;
  theme: SiteTheme | null;
  nav: NavItem[];
  settings: SiteSettings | null;
  themeRecord: Record<string, string>;
}

// cache() deduplicates calls within the same request — prevents N+1 when
// generateMetadata and the page component both call loadSiteChrome.
export const loadSiteChrome = cache(async (siteSlug: string): Promise<SiteChrome | null> => {
  try {
    const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug));
    if (!site) return null;

    // Fetch theme, nav and settings in parallel instead of sequentially
    const [themeRows, nav, settingsRows] = await Promise.all([
      db.select().from(siteThemes).where(eq(siteThemes.siteId, site.id)),
      db.select().from(navItems).where(eq(navItems.siteId, site.id)).orderBy(navItems.sortOrder),
      db.select().from(siteSettings).where(eq(siteSettings.siteId, site.id)),
    ]);

    const theme = themeRows[0] ?? null;
    const settings = settingsRows[0] ?? null;

    return {
      site,
      theme,
      nav,
      settings,
      themeRecord: themeRecord(theme),
    };
  } catch {
    return null;
  }
});
