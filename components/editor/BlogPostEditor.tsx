"use client";

import { useState } from "react";
import type { BlogPost, SiteTheme } from "@/lib/db";
import { EditorCanvas } from "./EditorCanvas";
import { BlockPalette } from "./BlockPalette";
import type { Block } from "@/lib/types/blocks";
import { Save, Globe, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  post: BlogPost;
  theme: SiteTheme;
}

export function BlogPostEditor({ post, theme }: Props) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [authorName, setAuthorName] = useState(post.authorName ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post.coverImageUrl ?? "");
  const [status, setStatus] = useState(post.status);
  const [blocks, setBlocks] = useState<Block[]>((post.content as Block[]) ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const themeRecord: Record<string, string> = {
    colorPrimary: theme?.colorPrimary ?? "#d97706",
    colorText: theme?.colorText ?? "#1c1917",
    colorTextMuted: theme?.colorTextMuted ?? "#78716c",
    fontHeading: theme?.fontHeading ?? "serif",
    fontBody: theme?.fontBody ?? "sans-serif",
    colorBackground: theme?.colorBackground ?? "#fffbf0",
    colorSurface: theme?.colorSurface ?? "#ffffff",
  };

  async function save(newStatus?: string) {
    setSaving(true);
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug, excerpt, authorName, coverImageUrl,
        content: blocks,
        status: newStatus ?? status,
        ...(newStatus === "published" ? { publishedAt: new Date().toISOString() } : {}),
      }),
    });
    if (newStatus) setStatus(newStatus);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-6 overflow-hidden">
      <div className="h-12 bg-white border-b border-stone-200 flex items-center px-3 gap-2 shrink-0">
        <Link href="/admin/blog" className="text-stone-400 hover:text-stone-700">
          <ChevronLeft size={18} />
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-sm font-medium text-stone-800 focus:outline-none bg-transparent max-w-xs"
          placeholder="Artikeltitel..."
        />
        <div className="flex-1" />
        <span className="text-xs text-stone-400">{saved ? "✓ Opgeslagen" : saving ? "Opslaan..." : ""}</span>
        <button onClick={() => save()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-stone-200 text-stone-600 hover:text-stone-900 rounded-lg">
          <Save size={13} /> Opslaan
        </button>
        {status !== "published" ? (
          <button onClick={() => save("published")} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg font-medium">
            <Globe size={13} /> Publiceren
          </button>
        ) : (
          <button onClick={() => save("draft")} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-600 hover:bg-stone-700 text-white text-sm rounded-lg font-medium">
            Depubliceren
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <BlockPalette onAdd={(block) => setBlocks((bs) => [...bs, block])} />

        <div className="flex-1 overflow-auto bg-stone-100">
          {/* Meta bar */}
          <div className="bg-white border-b border-stone-200 px-6 py-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-0.5">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-2 py-1 border border-stone-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-0.5">Auteur</label>
              <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full px-2 py-1 border border-stone-300 rounded text-sm" placeholder="Naam" />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-0.5">Cover afbeelding URL</label>
              <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="w-full px-2 py-1 border border-stone-300 rounded text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-0.5">Samenvatting</label>
              <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full px-2 py-1 border border-stone-300 rounded text-sm" />
            </div>
          </div>

          <div className="p-4">
            <EditorCanvas blocks={blocks} onChange={setBlocks} selectedId={selectedId} onSelect={setSelectedId} viewMode="desktop" theme={themeRecord} />
          </div>
        </div>
      </div>
    </div>
  );
}
