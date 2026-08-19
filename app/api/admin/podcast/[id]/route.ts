import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { podcastEpisodes } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [episode] = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.id, id));
  if (!episode) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(episode);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const allowed = [
    "title", "slug", "description", "audioUrl", "coverImageUrl",
    "durationSeconds", "status", "publishedAt", "sortOrder",
  ];
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }
  if (body.status === "published" && !body.publishedAt) {
    update.publishedAt = new Date().toISOString();
  }
  await db.update(podcastEpisodes).set(update).where(eq(podcastEpisodes.id, id));
  const [updated] = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.id, id));
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(podcastEpisodes).where(eq(podcastEpisodes.id, id));
  return NextResponse.json({ ok: true });
}
