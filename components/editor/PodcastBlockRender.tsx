"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic2 } from "lucide-react";
import type { PodcastBlock } from "@/lib/types/blocks";
import type { PodcastEpisode } from "@/lib/db";
import { useSiteStore } from "@/lib/stores/siteStore";

interface Props {
  block: PodcastBlock;
  theme: Record<string, string>;
  siteSlug?: string;
  isEditing?: boolean;
}

export function PodcastBlockRender({ block, theme, siteSlug, isEditing }: Props) {
  const { currentSite } = useSiteStore();
  const slug = siteSlug ?? currentSite?.slug;
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);

  const { mode, title, limit, episodeSlug, showDescriptions, linkLabel } = block.props;

  useEffect(() => {
    if (!slug || isEditing) return;
    setLoading(true);
    fetch(`/api/sites/${slug}/podcast?limit=${limit}`)
      .then((r) => r.json())
      .then((data) => setEpisodes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [slug, limit, isEditing]);

  const base = slug ? `/${slug}/podcast` : "#";

  if (mode === "link") {
    return (
      <div className="px-6 py-6 text-center">
        {title && (
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colorText, fontFamily: theme.fontHeading }}>
            {title}
          </h2>
        )}
        {isEditing ? (
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white" style={{ backgroundColor: theme.colorPrimary }}>
            <Mic2 size={16} /> {linkLabel}
          </span>
        ) : (
          <Link
            href={base}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium"
            style={{ backgroundColor: theme.colorPrimary }}
          >
            <Mic2 size={16} /> {linkLabel}
          </Link>
        )}
      </div>
    );
  }

  const list =
    mode === "single" && episodeSlug
      ? episodes.filter((e) => e.slug === episodeSlug)
      : episodes.slice(0, limit);

  if (isEditing) {
    return (
      <div className="px-6 py-6 max-w-2xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colorText, fontFamily: theme.fontHeading }}>
            {title}
          </h2>
        )}
        <div className="border border-dashed border-stone-300 rounded-xl p-6 text-center text-stone-400 text-sm">
          <Mic2 size={28} className="mx-auto mb-2 opacity-50" />
          Podcast ({mode === "single" ? "één aflevering" : "laatste afleveringen"})
          {episodeSlug && <p className="text-xs mt-1">Slug: {episodeSlug}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="px-6 py-8 text-center text-stone-400 text-sm">Podcast laden...</div>;
  }

  if (list.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-stone-400 text-sm">
        Nog geen gepubliceerde afleveringen.
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto space-y-4">
      {title && (
        <h2 className="text-2xl font-bold" style={{ color: theme.colorText, fontFamily: theme.fontHeading }}>
          {title}
        </h2>
      )}
      {list.map((ep) => (
        <article key={ep.id} className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex gap-3 mb-3">
            {ep.coverImageUrl ? (
              <img src={ep.coverImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Mic2 size={20} className="text-amber-700" />
              </div>
            )}
            <div className="min-w-0">
              <Link href={`${base}/${ep.slug}`} className="font-semibold hover:underline" style={{ color: theme.colorText }}>
                {ep.title}
              </Link>
              {ep.publishedAt && (
                <p className="text-xs text-stone-400 mt-0.5">
                  {new Date(ep.publishedAt).toLocaleDateString("nl-NL")}
                </p>
              )}
              {showDescriptions && ep.description && (
                <p className="text-sm text-stone-600 mt-1 line-clamp-2">{ep.description}</p>
              )}
            </div>
          </div>
          {ep.audioUrl && (
            <audio controls preload="none" className="w-full" src={ep.audioUrl}>
              Je browser ondersteunt geen audio.
            </audio>
          )}
        </article>
      ))}
      {mode === "latest" && (
        <div className="text-center pt-2">
          <Link href={base} className="text-sm font-medium" style={{ color: theme.colorPrimary }}>
            {linkLabel} →
          </Link>
        </div>
      )}
    </div>
  );
}
