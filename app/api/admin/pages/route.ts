import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { newId } from "@/lib/db/helpers";

const createSchema = z.object({
  siteId: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]*$/),
  pageType: z.enum(["page", "home", "legal"]).default("page"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });

  const result = await db.select().from(pages)
    .where(eq(pages.siteId, siteId))
    .orderBy(pages.sortOrder);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { siteId, title, slug, pageType } = parsed.data;

  const existing = await db.select().from(pages).where(
    and(eq(pages.siteId, siteId), eq(pages.slug, slug))
  );
  if (existing.length > 0) return NextResponse.json({ error: "Slug al in gebruik" }, { status: 400 });

  const id = newId();
  await db.insert(pages).values({
    id,
    siteId,
    title,
    slug,
    pageType,
    draftBlocks: [] as any,
    liveBlocks: [] as any,
  });
  const [page] = await db.select().from(pages).where(eq(pages.id, id));

  return NextResponse.json(page);
}
