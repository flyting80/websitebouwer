import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { deleteFile } from "@/lib/storage";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if ("folderId" in body) update.folderId = body.folderId || null;
  if ("alt" in body) update.alt = body.alt;
  if (Object.keys(update).length) {
    await db.update(media).set(update).where(eq(media.id, id));
  }
  const [file] = await db.select().from(media).where(eq(media.id, id));
  return NextResponse.json(file);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [file] = await db.select().from(media).where(eq(media.id, id));
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from local disk or cloud storage, whichever is active
  await deleteFile(file.storageKey ?? file.url.replace(/^\//, ""));

  await db.delete(media).where(eq(media.id, id));
  return NextResponse.json({ ok: true });
}
