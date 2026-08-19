import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, blogPosts } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteSlug: string }> }) {
  const { siteSlug } = await params;
  const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug));
  if (!site) return new NextResponse("Not found", { status: 404 });

  const posts: Array<{ title: string; slug: string; excerpt: string | null; publishedAt: string | null }> = await db.select().from(blogPosts).where(
    and(eq(blogPosts.siteId, site.id), eq(blogPosts.status, "published"))
  ).orderBy(desc(blogPosts.publishedAt)).limit(20);

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://saf4.nl";
  const siteUrl = site.domain ? `https://${site.domain}` : `${baseUrl}/${siteSlug}`;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(site.name)}</title>
    <link>${siteUrl}</link>
    <description>Blog van ${escXml(site.name)}</description>
    <language>nl</language>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${posts.map((post) => `
    <item>
      <title>${escXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      ${post.excerpt ? `<description>${escXml(post.excerpt)}</description>` : ""}
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
    </item>`).join("")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

function escXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
