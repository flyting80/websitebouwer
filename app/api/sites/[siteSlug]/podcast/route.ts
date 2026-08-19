import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, podcastEpisodes } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");

  const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug));
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .where(and(eq(podcastEpisodes.siteId, site.id), eq(podcastEpisodes.status, "published")))
    .orderBy(desc(podcastEpisodes.publishedAt))
    .limit(Math.min(limit, 50));

  return NextResponse.json(episodes);
}
