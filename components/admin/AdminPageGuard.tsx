"use client";
import { type ReactNode } from "react";
import Link from "next/link";
import { useSiteStore } from "@/lib/stores/siteStore";

interface Props {
  children: (site: NonNullable<ReturnType<typeof useSiteStore.getState>["currentSite"]>) => ReactNode;
}

export function AdminPageGuard({ children }: Props) {
  const { currentSite, loaded } = useSiteStore();

  if (!loaded) {
    return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  }

  if (!currentSite) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🌐</span>
        </div>
        <h2 className="text-lg font-semibold text-stone-700 mb-2">Geen site geselecteerd</h2>
        <p className="text-stone-500 text-sm mb-4">
          Kies een site om verder te gaan.
        </p>
        <Link
          href="/admin/sites"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          Naar Sites
        </Link>
      </div>
    );
  }

  return <>{children(currentSite)}</>;
}
