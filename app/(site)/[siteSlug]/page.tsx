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
  params: Promise<{ siteSlug: string }>;
}): Promise<Metadata> {
  const { siteSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) return {};
  const [homePage] = await db.select().from(pagesTable).where(
    and(eq(pagesTable.siteId, chrome.site.id), eq(pagesTable.pageType, "home"))
  );
  const title = homePage?.seoTitle || chrome.site.name;
  const description = homePage?.seoDescription || undefined;
  const image = homePage?.seoImage || undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const canonical = siteUrl ? `${siteUrl}/${siteSlug}` : undefined;
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

export default async function SiteHomePage({ params }: { params: Promise<{ siteSlug: string }> }) {
  const { siteSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) notFound();

  const [homePage] = await db.select().from(pagesTable).where(
    and(eq(pagesTable.siteId, chrome.site.id), eq(pagesTable.pageType, "home"))
  );

  const desktopBlocks = parseBlocks(homePage?.isPublished ? homePage.liveBlocks : []);
  const mobileBlocks = parseBlocks(homePage?.isPublished ? homePage.liveBlocksMobile : []);

  return (
    <SiteWrapper site={chrome.site} theme={chrome.themeRecord} navItems={chrome.nav} settings={chrome.settings}>
      <ResponsivePageContent
        desktopBlocks={desktopBlocks}
        mobileBlocks={mobileBlocks}
        site={chrome.site}
        theme={chrome.themeRecord}
        navItems={chrome.nav}
        settings={chrome.settings}
      />
    </SiteWrapper>
  );
}

export const dynamic = "force-dynamic";
