"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, EyeOff, Smartphone } from "lucide-react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { Page } from "@/lib/db";
import { slugify } from "@/lib/utils";

export default function PagesPage() {
  const { currentSite, loaded } = useSiteStore();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [creatingLegal, setCreatingLegal] = useState(false);

  useEffect(() => {
    if (!currentSite) { setLoading(false); return; }
    fetch(`/api/admin/pages?siteId=${currentSite.id}`)
      .then((r) => r.json())
      .then(setPages)
      .finally(() => setLoading(false));
  }, [currentSite]);

  async function createPage() {
    if (!currentSite || !newTitle) return;
    setCreating(true);
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: currentSite.id, title: newTitle, slug: slugify(newTitle) }),
    });
    if (res.ok) {
      const page = await res.json();
      setPages((ps) => [...ps, page]);
      setNewTitle("");
      setShowNewForm(false);
    }
    setCreating(false);
  }

  async function createLegal() {
    if (!currentSite) return;
    setCreatingLegal(true);
    const res = await fetch("/api/admin/pages/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: currentSite.id }),
    });
    if (res.ok) {
      const data = await res.json();
      const list = await fetch(`/api/admin/pages?siteId=${currentSite.id}`).then((r) => r.json());
      if (Array.isArray(list)) setPages(list);
      else if (Array.isArray(data.pages)) setPages(data.pages);
    }
    setCreatingLegal(false);
  }

  async function deletePage(id: string) {
    if (!confirm("Pagina verwijderen?")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    setPages((ps) => ps.filter((p) => p.id !== id));
  }

  if (!loaded) {
    return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  }

  if (!currentSite) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-stone-500">Kies eerst een site via <Link href="/admin/sites" className="text-amber-700 underline">Sites</Link>.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Pagina&apos;s</h1>
          <p className="text-stone-500 text-sm">{currentSite.name} — vink pagina&apos;s aan voor de menubalk via <Link href="/admin/nav" className="text-amber-700 underline">Menubalk</Link></p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={createLegal}
            disabled={creatingLegal}
            className="flex items-center gap-2 border border-stone-300 hover:border-amber-400 text-stone-700 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {creatingLegal ? "Aanmaken..." : "Juridische pagina's"}
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} /> Nieuwe pagina
          </button>
        </div>
      </div>

      {showNewForm && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex gap-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPage()}
            placeholder="Naam van de pagina..."
            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button onClick={createPage} disabled={creating || !newTitle} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm disabled:opacity-60">
            {creating ? "..." : "Aanmaken"}
          </button>
          <button onClick={() => setShowNewForm(false)} className="px-3 py-2 text-stone-500 hover:text-stone-700 text-sm">
            Annuleren
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-stone-400 text-sm">Laden...</div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800">{page.title}</p>
                <p className="text-stone-400 text-sm">/{page.slug || "home"}</p>
              </div>
                {page.pageType === "legal" && (
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Juridisch</span>
                )}
              {page.isPublished ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Globe size={11} /> Live
                </span>
              ) : (
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff size={11} /> Concept
                </span>
              )}
              <Link
                href={`/admin/pages/${page.id}/edit`}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-sm font-medium px-2 py-1 rounded hover:bg-amber-50"
              >
                <Pencil size={13} /> Bewerken
              </Link>
              <Link
                href={`/admin/preview?path=${encodeURIComponent(
                  page.pageType === "home" || !page.slug
                    ? `/${currentSite.slug}/preview`
                    : `/${currentSite.slug}/preview/${page.slug}`
                )}&device=mobile`}
                className="text-stone-400 hover:text-amber-700 p-1.5 rounded hover:bg-amber-50"
                title="Mobiele preview"
              >
                <Smartphone size={14} />
              </Link>
              <button
                onClick={() => deletePage(page.id)}
                className="text-stone-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {pages.length === 0 && (
            <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-200">
              Nog geen pagina's. Maak er een aan!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
