export const dynamic = "force-dynamic";
import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db";
import type { BlogPost } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SiteLayout as SiteWrapper } from "@/components/site/SiteLayout";
import { loadSiteChrome } from "@/lib/load-site-chrome";

export default async function SiteBlogPage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) notFound();

  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.siteId, chrome.site.id), eq(blogPosts.status, "published")))
    .orderBy(desc(blogPosts.publishedAt));

  return (
    <SiteWrapper site={chrome.site} theme={chrome.themeRecord} navItems={chrome.nav} settings={chrome.settings} headerContext="system">
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: chrome.themeRecord.fontHeading }}>
          Blog
        </h1>
        <p className="text-stone-500 mb-8">Updates, verhalen en tips.</p>

        <div className="space-y-4">
          {posts.map((post: BlogPost) => (
            <article key={post.id} className="bg-white border border-stone-200 rounded-xl p-5">
              <h2 className="text-2xl font-semibold mb-1" style={{ fontFamily: chrome.themeRecord.fontHeading }}>
                <Link href={`/${chrome.site.slug}/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              {post.publishedAt && (
                <p className="text-sm text-stone-400 mb-2">
                  {new Date(post.publishedAt).toLocaleDateString("nl-NL")}
                </p>
              )}
              {post.excerpt && <p className="text-stone-600">{post.excerpt}</p>}
            </article>
          ))}
          {posts.length === 0 && (
            <div className="text-stone-500 text-sm">Nog geen gepubliceerde artikelen.</div>
          )}
        </div>
      </section>
    </SiteWrapper>
  );
}
