export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { podcastEpisodes } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PodcastEpisodeEditor } from "@/components/admin/PodcastEpisodeEditor";

export default async function PodcastEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [episode] = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.id, id));
  if (!episode) notFound();
  return <PodcastEpisodeEditor episode={episode} />;
}
