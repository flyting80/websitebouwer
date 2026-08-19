import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { podcastEpisodes } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { newId } from "@/lib/db/helpers";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .where(eq(podcastEpisodes.siteId, siteId))
    .orderBy(desc(podcastEpisodes.publishedAt), desc(podcastEpisodes.createdAt));
  return NextResponse.json(episodes);
}

const createSchema = z.object({
  siteId: z.string().uuid(),
  title: z.string().min(1).max(300),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { siteId, title } = parsed.data;
  const id = newId();
  await db.insert(podcastEpisodes).values({
    id,
    siteId,
    title,
    slug: slugify(title),
    status: "draft",
  });
  const [episode] = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.id, id));
  return NextResponse.json(episode);
}
