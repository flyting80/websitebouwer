import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [page] = await db.select().from(pages).where(eq(pages.id, id));
  if (!page) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed = ["title", "slug", "draftBlocks", "draftBlocksMobile", "seoTitle", "seoDescription", "seoImage", "showInNav", "sortOrder"];
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  const jsonKeys = new Set(["draftBlocks", "draftBlocksMobile"]);
  for (const key of allowed) {
    if (key in body) update[key] = jsonKeys.has(key) ? JSON.stringify(body[key]) : body[key];
  }

  await db.update(pages).set(update).where(eq(pages.id, id));
  const [updated] = await db.select().from(pages).where(eq(pages.id, id));
  const parsed = {
    ...updated,
    draftBlocks: typeof updated.draftBlocks === "string" ? JSON.parse(updated.draftBlocks as string) : updated.draftBlocks,
    liveBlocks: typeof updated.liveBlocks === "string" ? JSON.parse(updated.liveBlocks as string) : updated.liveBlocks,
    draftBlocksMobile:
      typeof updated.draftBlocksMobile === "string"
        ? JSON.parse(updated.draftBlocksMobile as string)
        : updated.draftBlocksMobile ?? [],
    liveBlocksMobile:
      typeof updated.liveBlocksMobile === "string"
        ? JSON.parse(updated.liveBlocksMobile as string)
        : updated.liveBlocksMobile ?? [],
  };
  return NextResponse.json(parsed);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(pages).where(eq(pages.id, id));
  return NextResponse.json({ ok: true });
}
