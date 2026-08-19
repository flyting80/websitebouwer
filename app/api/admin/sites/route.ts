import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, siteThemes, siteSettings, navItems, pages } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { newId } from "@/lib/db/helpers";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  domain: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allSites = await db.select().from(sites).orderBy(sites.createdAt);
  return NextResponse.json(allSites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, slug, domain, contactEmail } = parsed.data;

  // Check slug uniqueness
  const existing = await db.select().from(sites).where(
    // dynamic import to avoid circular
    (await import("drizzle-orm")).eq(sites.slug, slug)
  );
  if (existing.length > 0) {
    return NextResponse.json({ error: "Slug al in gebruik" }, { status: 400 });
  }

  const siteId = newId();
  await db.insert(sites).values({
    id: siteId,
    name,
    slug,
    domain: domain ?? null,
    contactEmail: contactEmail ?? null,
  });
  const [site] = await db.select().from(sites).where(
    (await import("drizzle-orm")).eq(sites.id, siteId)
  );

  // Create default theme (warm)
  await db.insert(siteThemes).values({ siteId });

  // Create default settings
  await db.insert(siteSettings).values({ siteId });

  // Create default Home page
  await db.insert(pages).values({
    id: newId(),
    siteId,
    title: "Home",
    slug: "",
    pageType: "home",
    draftBlocks: JSON.stringify([
      {
        id: "hero-default",
        type: "hero",
        props: {
          title: `Welkom bij ${name}`,
          subtitle: "Bewerk deze tekst in de editor",
          backgroundOverlay: 40,
          align: "center",
          minHeight: 500,
        },
      },
    ]) as any,
    showInNav: false,
    sortOrder: 0,
  });

  // Default nav items
  await db.insert(navItems).values([
    { id: newId(), siteId, label: "Home", href: "/", sortOrder: 0, placement: "both" },
    { id: newId(), siteId, label: "Over ons", href: "/over-ons", sortOrder: 1, placement: "both" },
    { id: newId(), siteId, label: "Contact", href: "/contact", sortOrder: 2, placement: "both" },
  ]);

  return NextResponse.json(site);
}
