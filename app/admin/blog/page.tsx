"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, EyeOff } from "lucide-react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { BlogPost } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const { currentSite, loaded } = useSiteStore(); 
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded || !currentSite) { setLoading(false); return; }
    fetch(`/api/admin/blog?siteId=${currentSite.id}`)
      .then((r) => r.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [loaded, currentSite]);

  async function deletePost(id: string) {
    if (!confirm("Artikel verwijderen?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setPosts((ps) => ps.filter((p) => p.id !== id));
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Blog</h1>
          <p className="text-stone-500 text-sm">{currentSite.name}</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nieuw artikel
        </Link>
      </div>

      {loading ? <p className="text-stone-400 text-sm">Laden...</p> : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3">
              {post.coverImageUrl && (
                <img src={post.coverImageUrl} alt={post.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 truncate">{post.title}</p>
                <p className="text-stone-400 text-xs">
                  {post.authorName && <span>{post.authorName} · </span>}
                  {post.publishedAt ? formatDate(post.publishedAt) : "Geen datum"}
                </p>
              </div>
              {post.status === "published" ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={11} /> Live</span>
              ) : (
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full flex items-center gap-1"><EyeOff size={11} /> Concept</span>
              )}
              <Link
                href={`/admin/blog/${post.id}`}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-sm font-medium px-2 py-1 rounded hover:bg-amber-50"
              >
                <Pencil size={13} /> Bewerken
              </Link>
              <button onClick={() => deletePost(post.id)} className="text-stone-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-200">
              Nog geen artikelen.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
