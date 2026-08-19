import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages, navItems } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/db/helpers";
import { LEGAL_PAGES, legalBlocks } from "@/lib/legal-pages";
import { sites } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await req.json();
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });

  const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
  if (!site) return NextResponse.json({ error: "Site niet gevonden" }, { status: 404 });

  const created: unknown[] = [];
  const existing = await db.select().from(pages).where(eq(pages.siteId, siteId));
  const nav = await db.select().from(navItems).where(eq(navItems.siteId, siteId));
  let sort = nav.length;

  for (const spec of LEGAL_PAGES) {
    const already = existing.find((p: { slug: string }) => p.slug === spec.slug);
    if (already) {
      created.push(already);
      continue;
    }

    const blocks = legalBlocks(site.name, spec.kind);
    const id = newId();
    await db.insert(pages).values({
      id,
      siteId,
      title: spec.title,
      slug: spec.slug,
      pageType: "legal",
      draftBlocks: blocks as never,
      liveBlocks: blocks as never,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      showInNav: false,
      seoTitle: `${spec.title} | ${site.name}`,
      seoDescription: `${spec.title} van ${site.name}.`,
    });
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    created.push(page);

    const href = `/${spec.slug}`;
    const navExists = nav.some((n: { href: string }) => n.href === href);
    if (!navExists) {
      await db.insert(navItems).values({
        id: newId(),
        siteId,
        label: spec.title,
        href,
        sortOrder: sort++,
        placement: "footer",
        openInNewTab: false,
      });
    }
  }

  return NextResponse.json({ pages: created });
}
