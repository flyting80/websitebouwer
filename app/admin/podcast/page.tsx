"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, EyeOff, Mic2 } from "lucide-react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { PodcastEpisode } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default function PodcastPage() {
  const { currentSite, loaded } = useSiteStore();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded || !currentSite) { setLoading(false); return; }
    fetch(`/api/admin/podcast?siteId=${currentSite.id}`)
      .then((r) => r.json())
      .then(setEpisodes)
      .finally(() => setLoading(false));
  }, [loaded, currentSite]);

  async function deleteEpisode(id: string) {
    if (!confirm("Aflevering verwijderen?")) return;
    await fetch(`/api/admin/podcast/${id}`, { method: "DELETE" });
    setEpisodes((es) => es.filter((e) => e.id !== id));
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Podcast</h1>
          <p className="text-stone-500 text-sm">{currentSite.name} · Live op /{currentSite.slug}/podcast</p>
        </div>
        <Link
          href="/admin/podcast/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nieuwe aflevering
        </Link>
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">Laden...</p>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <div key={ep.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3">
              {ep.coverImageUrl ? (
                <img src={ep.coverImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Mic2 size={20} className="text-amber-700" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 truncate">{ep.title}</p>
                <p className="text-stone-400 text-xs">
                  {ep.publishedAt ? formatDate(ep.publishedAt) : "Geen datum"}
                  {ep.audioUrl ? " · Audio gekoppeld" : " · Geen audio"}
                </p>
              </div>
              {ep.status === "published" ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Globe size={11} /> Live
                </span>
              ) : (
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff size={11} /> Concept
                </span>
              )}
              <Link
                href={`/admin/podcast/${ep.id}`}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-sm font-medium px-2 py-1 rounded hover:bg-amber-50"
              >
                <Pencil size={13} /> Bewerken
              </Link>
              <button onClick={() => deleteEpisode(ep.id)} className="text-stone-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {episodes.length === 0 && (
            <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-200">
              Nog geen afleveringen. Upload audio via Media en maak je eerste aflevering.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
