import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { pages as pagesTable, blogPosts, podcastEpisodes, sites } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// Build the canonical base URL for a site.
// Priority: custom domain → NEXT_PUBLIC_SITE_URL/{siteSlug} → relative fallback.
function siteBaseUrl(siteSlug: string, domain?: string | null): string {
  if (domain) return `https://${domain}`;
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (base) return `${base.replace(/\/$/, "")}/${siteSlug}`;
  return `https://example.com/${siteSlug}`;
}

export default async function sitemap({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { siteSlug } = await params;

  const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug));
  if (!site) return [];

  const base = siteBaseUrl(siteSlug, site.domain);
  const entries: MetadataRoute.Sitemap = [];

  // ── Homepage ──────────────────────────────────────────────────────────────
  entries.push({
    url: base,
    lastModified: site.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  });

  // ── Regular pages ─────────────────────────────────────────────────────────
  const regularPages = await db
    .select({ slug: pagesTable.slug, updatedAt: pagesTable.updatedAt })
    .from(pagesTable)
    .where(
      and(
        eq(pagesTable.siteId, site.id),
        eq(pagesTable.isPublished, true),
      )
    );

  for (const page of regularPages) {
    if (!page.slug) continue; // homepage slug is ""
    entries.push({
      url: `${base}/${page.slug}`,
      lastModified: page.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // ── Blog posts ─────────────────────────────────────────────────────────────
  const posts = await db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(and(eq(blogPosts.siteId, site.id), eq(blogPosts.status, "published")));

  if (posts.length > 0) {
    // Blog index page
    entries.push({
      url: `${base}/blog`,
      lastModified: posts[0].updatedAt ?? new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });

    for (const post of posts) {
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // ── Podcast episodes ───────────────────────────────────────────────────────
  const episodes = await db
    .select({ slug: podcastEpisodes.slug, updatedAt: podcastEpisodes.updatedAt })
    .from(podcastEpisodes)
    .where(and(eq(podcastEpisodes.siteId, site.id), eq(podcastEpisodes.status, "published")));

  if (episodes.length > 0) {
    entries.push({
      url: `${base}/podcast`,
      lastModified: episodes[0].updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });

    for (const ep of episodes) {
      entries.push({
        url: `${base}/podcast/${ep.slug}`,
        lastModified: ep.updatedAt ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
