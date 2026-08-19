import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mediaFolders } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/db/helpers";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const folders = await db.select().from(mediaFolders).where(eq(mediaFolders.siteId, siteId));
  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { siteId, name, parentId } = body;
  if (!siteId || !name?.trim()) {
    return NextResponse.json({ error: "siteId and name required" }, { status: 400 });
  }
  const id = newId();
  await db.insert(mediaFolders).values({
    id,
    siteId,
    name: name.trim(),
    parentId: parentId || null,
  });
  const [folder] = await db.select().from(mediaFolders).where(eq(mediaFolders.id, id));
  return NextResponse.json(folder);
}
