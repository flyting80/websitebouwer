"use client";
import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { Site } from "@/lib/db";

export function SiteCard({ site }: { site: Site }) {
  const { setCurrentSite } = useSiteStore();

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
        <Globe size={20} className="text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800">{site.name}</p>
        <p className="text-stone-400 text-sm truncate">
          {site.domain ?? `/${site.slug}`}
        </p>
      </div>
      <Link
        href={`/admin/sites/${site.id}`}
        onClick={() => setCurrentSite(site)}
        className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-sm font-medium transition-colors"
      >
        Beheren <ArrowRight size={14} />
      </Link>
    </div>
  );
}
