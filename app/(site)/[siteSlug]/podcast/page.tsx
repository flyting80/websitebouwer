export const dynamic = "force-dynamic";
import Link from "next/link";
import { db } from "@/lib/db";
import { podcastEpisodes } from "@/lib/db";
import type { PodcastEpisode } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SiteLayout as SiteWrapper } from "@/components/site/SiteLayout";
import { loadSiteChrome } from "@/lib/load-site-chrome";
import { Mic2 } from "lucide-react";

export default async function SitePodcastPage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) notFound();

  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .where(and(eq(podcastEpisodes.siteId, chrome.site.id), eq(podcastEpisodes.status, "published")))
    .orderBy(desc(podcastEpisodes.publishedAt));

  return (
    <SiteWrapper site={chrome.site} theme={chrome.themeRecord} navItems={chrome.nav} settings={chrome.settings} headerContext="system">
      <section className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: chrome.themeRecord.fontHeading }}>
          Podcast
        </h1>
        <p className="text-stone-500 mb-8">Luister naar onze afleveringen.</p>

        <div className="space-y-4">
          {episodes.map((ep: PodcastEpisode) => (
            <article key={ep.id} className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex gap-4 mb-3">
                {ep.coverImageUrl ? (
                  <img src={ep.coverImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Mic2 size={24} className="text-amber-700" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: chrome.themeRecord.fontHeading }}>
                    <Link href={`/${chrome.site.slug}/podcast/${ep.slug}`} className="hover:underline">
                      {ep.title}
                    </Link>
                  </h2>
                  {ep.publishedAt && (
                    <p className="text-sm text-stone-400 mb-1">
                      {new Date(ep.publishedAt).toLocaleDateString("nl-NL")}
                    </p>
                  )}
                  {ep.description && <p className="text-stone-600 text-sm">{ep.description}</p>}
                </div>
              </div>
              {ep.audioUrl && (
                <audio controls preload="none" className="w-full" src={ep.audioUrl}>
                  Je browser ondersteunt geen audio.
                </audio>
              )}
            </article>
          ))}
          {episodes.length === 0 && (
            <div className="text-stone-500 text-sm">Nog geen gepubliceerde afleveringen.</div>
          )}
        </div>
      </section>
    </SiteWrapper>
  );
}
