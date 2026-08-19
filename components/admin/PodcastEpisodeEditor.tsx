"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Globe } from "lucide-react";
import type { PodcastEpisode } from "@/lib/db";
import { MediaPicker } from "@/components/editor/MediaPicker";
import { slugify } from "@/lib/utils";

export function PodcastEpisodeEditor({ episode }: { episode: PodcastEpisode }) {
  const [title, setTitle] = useState(episode.title);
  const [slug, setSlug] = useState(episode.slug);
  const [description, setDescription] = useState(episode.description ?? "");
  const [audioUrl, setAudioUrl] = useState(episode.audioUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(episode.coverImageUrl ?? "");
  const [status, setStatus] = useState(episode.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/podcast/${episode.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slug || slugify(title),
        description,
        audioUrl: audioUrl || null,
        coverImageUrl: coverImageUrl || null,
        status,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function publish() {
    setStatus("published");
    setSaving(true);
    await fetch(`/api/admin/podcast/${episode.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slug || slugify(title),
        description,
        audioUrl: audioUrl || null,
        coverImageUrl: coverImageUrl || null,
        status: "published",
        publishedAt: new Date().toISOString(),
      }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/podcast" className="text-stone-400 hover:text-stone-700">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">Aflevering bewerken</h1>
        </div>
        <div className="flex gap-2">
          <span className="text-xs self-center text-stone-400">{saved ? "Opgeslagen ✓" : saving ? "Opslaan..." : ""}</span>
          <button onClick={save} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-lg text-sm">
            <Save size={14} /> Opslaan
          </button>
          <button onClick={publish} disabled={saving || !audioUrl} className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm disabled:opacity-60">
            <Globe size={14} /> Publiceren
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Titel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">URL-slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Beschrijving</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm resize-none" />
        </div>
        <MediaPicker
          label="Audio (MP3/M4A uit Media)"
          url={audioUrl}
          acceptAudio
          onSelect={(m) => setAudioUrl(m.url)}
          onClear={() => setAudioUrl("")}
        />
        <Field label="Of audio-URL">
          <input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
        </Field>
        <MediaPicker
          label="Coverafbeelding"
          url={coverImageUrl}
          onSelect={(m) => setCoverImageUrl(m.url)}
          onClear={() => setCoverImageUrl("")}
        />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="draft" checked={status === "draft"} onChange={(e) => setStatus(e.target.checked ? "draft" : "published")} />
          <label htmlFor="draft" className="text-sm text-stone-600">Concept (niet zichtbaar op de site)</label>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
