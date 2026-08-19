import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [page] = await db.select().from(pages).where(eq(pages.id, id));
  if (!page) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  await db.update(pages).set({
    liveBlocks: page.draftBlocks,
    liveBlocksMobile: page.draftBlocksMobile,
    isPublished: true,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).where(eq(pages.id, id));

  const [updated] = await db.select().from(pages).where(eq(pages.id, id));
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.update(pages).set({
    isPublished: false,
    updatedAt: new Date().toISOString(),
  }).where(eq(pages.id, id));

  const [updated] = await db.select().from(pages).where(eq(pages.id, id));
  return NextResponse.json(updated);
}
