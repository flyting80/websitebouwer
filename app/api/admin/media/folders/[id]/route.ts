import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media, mediaFolders } from "@/lib/db";
import { auth } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if ("name" in body) update.name = String(body.name).trim();
  if ("parentId" in body) update.parentId = body.parentId || null;
  if (Object.keys(update).length) {
    await db.update(mediaFolders).set(update).where(eq(mediaFolders.id, id));
  }
  const [folder] = await db.select().from(mediaFolders).where(eq(mediaFolders.id, id));
  return NextResponse.json(folder);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [folder] = await db.select().from(mediaFolders).where(eq(mediaFolders.id, id));
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.update(media).set({ folderId: folder.parentId ?? null }).where(eq(media.folderId, id));
  await db.update(mediaFolders).set({ parentId: folder.parentId ?? null }).where(eq(mediaFolders.parentId, id));
  await db.delete(mediaFolders).where(eq(mediaFolders.id, id));
  return NextResponse.json({ ok: true });
}
