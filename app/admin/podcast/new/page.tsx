"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteStore } from "@/lib/stores/siteStore";

export default function NewPodcastEpisodePage() {
  const router = useRouter();
  const { currentSite, loaded } = useSiteStore();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!currentSite || !title) return;
    setLoading(true);
    const res = await fetch("/api/admin/podcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: currentSite.id, title }),
    });
    if (res.ok) {
      const ep = await res.json();
      router.push(`/admin/podcast/${ep.id}`);
    }
    setLoading(false);
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Nieuwe podcast-aflevering</h1>
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Titel *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="Aflevering 1: Introductie"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={create} disabled={loading || !title} className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-medium disabled:opacity-60">
            {loading ? "Aanmaken..." : "Aanmaken en bewerken"}
          </button>
          <button onClick={() => router.back()} className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50">
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
