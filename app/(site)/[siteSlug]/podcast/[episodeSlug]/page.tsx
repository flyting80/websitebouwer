export const dynamic = "force-dynamic";
import Link from "next/link";
import { db } from "@/lib/db";
import { podcastEpisodes } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SiteLayout as SiteWrapper } from "@/components/site/SiteLayout";
import { loadSiteChrome } from "@/lib/load-site-chrome";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string; episodeSlug: string }>;
}): Promise<Metadata> {
  const { siteSlug, episodeSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) return {};
  const [ep] = await db
    .select()
    .from(podcastEpisodes)
    .where(
      and(
        eq(podcastEpisodes.siteId, chrome.site.id),
        eq(podcastEpisodes.slug, episodeSlug),
        eq(podcastEpisodes.status, "published")
      )
    );
  if (!ep) return {};
  return {
    title: ep.title,
    description: ep.description ?? undefined,
    openGraph: {
      title: ep.title,
      description: ep.description ?? undefined,
      images: ep.coverImageUrl ? [ep.coverImageUrl] : undefined,
    },
  };
}

export default async function SitePodcastEpisodePage({
  params,
}: {
  params: Promise<{ siteSlug: string; episodeSlug: string }>;
}) {
  const { siteSlug, episodeSlug } = await params;
  const chrome = await loadSiteChrome(siteSlug);
  if (!chrome) notFound();

  const [ep] = await db
    .select()
    .from(podcastEpisodes)
    .where(
      and(
        eq(podcastEpisodes.siteId, chrome.site.id),
        eq(podcastEpisodes.slug, episodeSlug),
        eq(podcastEpisodes.status, "published")
      )
    );
  if (!ep) notFound();

  return (
    <SiteWrapper site={chrome.site} theme={chrome.themeRecord} navItems={chrome.nav} settings={chrome.settings} headerContext="system">
      <article className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href={`/${chrome.site.slug}/podcast`}
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6"
        >
          <ChevronLeft size={16} /> Alle afleveringen
        </Link>

        {ep.coverImageUrl && (
          <img src={ep.coverImageUrl} alt={ep.title} className="w-full rounded-xl mb-6 object-cover max-h-[320px]" />
        )}

        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: chrome.themeRecord.fontHeading }}>
            {ep.title}
          </h1>
          {ep.publishedAt && (
            <p className="text-sm text-stone-400">
              {new Date(ep.publishedAt).toLocaleDateString("nl-NL")}
            </p>
          )}
        </header>

        {ep.description && (
          <p className="text-stone-600 mb-6 whitespace-pre-wrap">{ep.description}</p>
        )}

        {ep.audioUrl ? (
          <audio controls preload="metadata" className="w-full" src={ep.audioUrl}>
            Je browser ondersteunt geen audio.
          </audio>
        ) : (
          <p className="text-stone-400 text-sm">Geen audio beschikbaar.</p>
        )}
      </article>
    </SiteWrapper>
  );
}
