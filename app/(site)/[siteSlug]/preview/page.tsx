export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pages as pagesTable } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { SiteLayout as SiteWrapper } from "@/components/site/SiteLayout";
import { ResponsivePageContent } from "@/components/site/ResponsivePageContent";
import { parseBlocks } from "@/lib/page-blocks";
import { loadSiteChrome } from "@/lib/load-site-chrome";

export default async function PreviewHomePage({ params }: { params: Promise<{ siteSlug: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { siteSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) notFound();

  const [homePage] = await db.select().from(pagesTable).where(
    and(eq(pagesTable.siteId, chrome.site.id), eq(pagesTable.pageType, "home"))
  );
  const blocks = parseBlocks(homePage?.draftBlocks);
  const mobileBlocks = parseBlocks(homePage?.draftBlocksMobile);

  return (
    <SiteWrapper site={chrome.site} theme={chrome.themeRecord} navItems={chrome.nav} settings={chrome.settings} preview>
      <ResponsivePageContent
        desktopBlocks={blocks}
        mobileBlocks={mobileBlocks}
        site={chrome.site}
        theme={chrome.themeRecord}
        navItems={chrome.nav}
        settings={chrome.settings}
        emptyLabel="Dit concept is nog leeg."
      />
    </SiteWrapper>
  );
}
