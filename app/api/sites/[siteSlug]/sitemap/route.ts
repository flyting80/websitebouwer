import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages as pagesTable, blogPosts, podcastEpisodes, sites } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

function siteBaseUrl(siteSlug: string, domain?: string | null): string {
  if (domain) return `https://${domain}`;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL;
  if (base) return `${base.replace(/\/$/, "")}/${siteSlug}`;
  return `https://example.com/${siteSlug}`;
}

function escXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  loc: string,
  lastmod?: Date | string | null,
  changefreq?: string,
  priority?: string
): string {
  const mod = lastmod ? new Date(lastmod).toISOString() : new Date().toISOString();
  return `  <url>
    <loc>${escXml(loc)}</loc>
    <lastmod>${mod}</lastmod>
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    ${priority ? `<priority>${priority}</priority>` : ""}
  </url>`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;
  if (!siteSlug || siteSlug === "-") {
    return new NextResponse("Not found", { status: 404 });
  }

  const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug));
  if (!site) return new NextResponse("Not found", { status: 404 });

  const base = siteBaseUrl(siteSlug, site.domain);
  const entries: string[] = [
    urlEntry(base, site.updatedAt, "weekly", "1.0"),
  ];

  const regularPages = await db
    .select({ slug: pagesTable.slug, updatedAt: pagesTable.updatedAt })
    .from(pagesTable)
    .where(and(eq(pagesTable.siteId, site.id), eq(pagesTable.isPublished, true)));

  for (const page of regularPages) {
    if (!page.slug) continue;
    entries.push(urlEntry(`${base}/${page.slug}`, page.updatedAt, "weekly", "0.8"));
  }

  const posts = await db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(and(eq(blogPosts.siteId, site.id), eq(blogPosts.status, "published")));

  if (posts.length > 0) {
    entries.push(urlEntry(`${base}/blog`, posts[0].updatedAt, "daily", "0.7"));
    for (const post of posts) {
      entries.push(urlEntry(`${base}/blog/${post.slug}`, post.updatedAt, "monthly", "0.6"));
    }
  }

  const episodes = await db
    .select({ slug: podcastEpisodes.slug, updatedAt: podcastEpisodes.updatedAt })
    .from(podcastEpisodes)
    .where(and(eq(podcastEpisodes.siteId, site.id), eq(podcastEpisodes.status, "published")));

  if (episodes.length > 0) {
    entries.push(urlEntry(`${base}/podcast`, episodes[0].updatedAt, "weekly", "0.7"));
    for (const ep of episodes) {
      entries.push(urlEntry(`${base}/podcast/${ep.slug}`, ep.updatedAt, "monthly", "0.5"));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
