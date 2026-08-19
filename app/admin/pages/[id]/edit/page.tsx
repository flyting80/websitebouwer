export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { pages, sites, siteThemes } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageEditor } from "@/components/editor/PageEditor";
import { parsePageJsonFields } from "@/lib/page-blocks";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page] = await db.select().from(pages).where(eq(pages.id, id));
  if (!page) notFound();

  const [site] = await db.select().from(sites).where(eq(sites.id, page.siteId));
  const [theme] = await db.select().from(siteThemes).where(eq(siteThemes.siteId, page.siteId));

  const parsedPage = parsePageJsonFields(page);

  return (
    <PageEditor
      page={parsedPage as typeof page}
      site={site}
      theme={theme}
    />
  );
}
