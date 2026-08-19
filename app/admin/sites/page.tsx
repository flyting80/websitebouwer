export const dynamic = "force-dynamic";
import { db, sites } from "@/lib/db";
import type { Site } from "@/lib/db";
import Link from "next/link";
import { Plus, Globe } from "lucide-react";
import { SiteSelector } from "@/components/admin/SiteSelector";
import { SiteCard } from "@/components/admin/SiteCard";

export default async function SitesPage() {
  const allSites = await db.select().from(sites).orderBy(sites.createdAt);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Websites</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Beheer al je losse sites in één omgeving.
          </p>
        </div>
        <Link
          href="/admin/sites/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nieuwe site
        </Link>
      </div>

      <SiteSelector sites={allSites} />

      {allSites.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <Globe size={40} className="mx-auto text-stone-300 mb-3" />
          <h2 className="font-semibold text-stone-700 mb-1">Nog geen sites</h2>
          <p className="text-stone-500 text-sm mb-4">
            Maak je eerste website aan om te beginnen.
          </p>
          <Link
            href="/admin/sites/new"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Eerste site aanmaken
          </Link>
        </div>
      )}

      {allSites.length > 0 && (
        <div className="grid gap-3 mt-4">
          {allSites.map((site: Site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}

