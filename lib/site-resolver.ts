import { db } from "./db";
import { sites, siteThemes, navItems, siteSettings } from "./db";
import { eq, or } from "drizzle-orm";
import type { Site, SiteTheme, NavItem, SiteSettings } from "./db/schema-sqlite";

export interface ResolvedSite {
  site: Site;
  theme: SiteTheme | null;
  navItems: NavItem[];
  settings: SiteSettings | null;
}

export async function resolveSiteBySlug(slug: string): Promise<ResolvedSite | null> {
  const [site] = await db.select().from(sites).where(eq(sites.slug, slug));
  if (!site) return null;
  return loadSiteData(site);
}

export async function resolveSiteByDomain(domain: string): Promise<ResolvedSite | null> {
  const [site] = await db.select().from(sites).where(
    or(eq(sites.domain, domain), eq(sites.domain, `www.${domain}`))
  );
  if (!site) return null;
  return loadSiteData(site);
}

async function loadSiteData(site: Site): Promise<ResolvedSite> {
  const [theme] = await db.select().from(siteThemes).where(eq(siteThemes.siteId, site.id));
  const nav = await db.select().from(navItems).where(eq(navItems.siteId, site.id)).orderBy(navItems.sortOrder);
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.siteId, site.id));
  return { site, theme: theme ?? null, navItems: nav, settings: settings ?? null };
}
