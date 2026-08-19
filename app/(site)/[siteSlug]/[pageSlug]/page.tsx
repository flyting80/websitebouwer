export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { pages as pagesTable } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SiteLayout as SiteWrapper } from "@/components/site/SiteLayout";
import { ResponsivePageContent } from "@/components/site/ResponsivePageContent";
import { parseBlocks } from "@/lib/page-blocks";
import { loadSiteChrome } from "@/lib/load-site-chrome";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { siteSlug, pageSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) return {};
  const [page] = await db.select().from(pagesTable).where(
    and(eq(pagesTable.siteId, chrome.site.id), eq(pagesTable.slug, pageSlug))
  );
  if (!page || !page.isPublished) return {};
  const title = page.seoTitle || page.title;
  const description = page.seoDescription || undefined;
  const image = page.seoImage || undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const canonical = siteUrl ? `${siteUrl}/${siteSlug}/${pageSlug}` : undefined;
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function SitePageRoute({
  params,
}: {
  params: Promise<{ siteSlug: string; pageSlug: string }>;
}) {
  const { siteSlug, pageSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) notFound();

  const [page] = await db.select().from(pagesTable).where(
    and(eq(pagesTable.siteId, chrome.site.id), eq(pagesTable.slug, pageSlug))
  );
  if (!page || !page.isPublished) notFound();

  const blocks = parseBlocks(page.liveBlocks);
  const mobileBlocks = parseBlocks(page.liveBlocksMobile);

  return (
    <SiteWrapper site={chrome.site} theme={chrome.themeRecord} navItems={chrome.nav} settings={chrome.settings}>
      <ResponsivePageContent
        desktopBlocks={blocks}
        mobileBlocks={mobileBlocks}
        site={chrome.site}
        theme={chrome.themeRecord}
        navItems={chrome.nav}
        settings={chrome.settings}
      />
    </SiteWrapper>
  );
}
