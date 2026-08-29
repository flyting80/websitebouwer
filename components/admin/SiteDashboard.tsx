"use client";
import { useSiteStore } from "@/lib/stores/siteStore";
import { useEffect } from "react";
import type { Site } from "@/lib/db";
import Link from "next/link";
import { FileText, BookOpen, Image, MessageSquare, Palette, Settings, ArrowRight, Globe } from "lucide-react";

const LINKS = [
  { href: "/admin/pages", label: "Pagina's", icon: FileText, desc: "Beheer en bewerk alle pagina's" },
  { href: "/admin/blog", label: "Blog", icon: BookOpen, desc: "Artikelen schrijven en publiceren" },
  { href: "/admin/media", label: "Media", icon: Image, desc: "Afbeeldingen uploaden" },
  { href: "/admin/messages", label: "Berichten", icon: MessageSquare, desc: "Contactformulier-inbox" },
  { href: "/admin/theme", label: "Thema", icon: Palette, desc: "Kleuren, fonts en stijl" },
  { href: "/admin/settings", label: "Instellingen", icon: Settings, desc: "Domein, e-mail, analytics" },
];

export function SiteDashboard({ site }: { site: Site }) {
  const { setCurrentSite } = useSiteStore();

  useEffect(() => {
    setCurrentSite(site);
  }, [site, setCurrentSite]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Globe size={22} className="text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{site.name}</h1>
          <p className="text-stone-400 text-sm">{site.domain ?? `/${site.slug}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {LINKS.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-stone-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
              <Icon size={18} className="text-amber-700" />
            </div>
            <p className="font-semibold text-stone-800 text-sm">{label}</p>
            <p className="text-stone-400 text-xs mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 font-medium mb-1">Site URL</p>
        <div className="flex items-center gap-2">
          <code className="text-sm bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 flex-1">
            {site.domain ? `https://${site.domain}` : `/${site.slug}`}
          </code>
          <Link
            href={site.domain ? `https://${site.domain}` : `/${site.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 font-medium px-3 py-1.5 bg-white border border-amber-200 rounded-lg"
          >
            Bekijken <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
