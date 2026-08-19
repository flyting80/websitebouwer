"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slug = slugify(name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, domain: domain || null, contactEmail: contactEmail || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Fout");
      const site = await res.json();
      router.push(`/admin/sites/${site.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Nieuwe website aanmaken</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Naam van de website *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Schatgraven met kinderen"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
          />
          {slug && (
            <p className="text-xs text-stone-400 mt-1">Slug: <code className="bg-stone-100 px-1 rounded">{slug}</code></p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Eigen domein (optioneel)</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="schatgravenmetkinderen.nl"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
          />
          <p className="text-xs text-stone-400 mt-1">Laat leeg om later in te stellen</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Contact e-mailadres</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="info@jouwdomein.nl"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !name}
            className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            {loading ? "Aanmaken..." : "Site aanmaken"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
