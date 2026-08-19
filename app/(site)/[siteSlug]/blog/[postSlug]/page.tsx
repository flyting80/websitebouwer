export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SiteLayout as SiteWrapper } from "@/components/site/SiteLayout";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import type { Block } from "@/lib/types/blocks";
import { loadSiteChrome } from "@/lib/load-site-chrome";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string; postSlug: string }>;
}): Promise<Metadata> {
  const { siteSlug, postSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) return {};
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.siteId, chrome.site.id), eq(blogPosts.slug, postSlug), eq(blogPosts.status, "published")));
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function SiteBlogPostPage({
  params,
}: {
  params: Promise<{ siteSlug: string; postSlug: string }>;
}) {
  const { siteSlug, postSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) notFound();

  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.siteId, chrome.site.id), eq(blogPosts.slug, postSlug), eq(blogPosts.status, "published")));
  if (!post) notFound();

  const rawContent = post.content;
  const blocks = (typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent ?? []) as Block[];

  return (
    <SiteWrapper site={chrome.site} theme={chrome.themeRecord} navItems={chrome.nav} settings={chrome.settings} headerContext="system">
      <article className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: chrome.themeRecord.fontHeading }}>
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="text-sm text-stone-400">
              {new Date(post.publishedAt).toLocaleDateString("nl-NL")}
              {post.authorName ? ` · ${post.authorName}` : ""}
            </p>
          )}
          {post.excerpt && <p className="mt-4 text-stone-600">{post.excerpt}</p>}
        </header>

        {post.coverImageUrl && (
          <img src={post.coverImageUrl} alt={post.title} className="w-full rounded-xl mb-8 object-cover max-h-[460px]" />
        )}

        <div className="space-y-3">
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} theme={chrome.themeRecord} siteId={chrome.site.id} siteSlug={chrome.site.slug} />
          ))}
        </div>
      </article>
    </SiteWrapper>
  );
}
