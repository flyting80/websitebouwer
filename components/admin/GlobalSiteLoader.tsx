"use client";
import { useEffect } from "react";
import { useSiteStore } from "@/lib/stores/siteStore";

const STORAGE_KEY = "activeSiteId";

export function GlobalSiteLoader() {
  const { loaded, setLoaded, setCurrentSite, setSites } = useSiteStore();

  useEffect(() => {
    if (loaded) return;
    fetch("/api/admin/sites")
      .then((r) => r.json())
      .then((sites: Array<{ id: string; name: string; slug: string; domain: string | null; contactEmail: string | null; createdAt: string; updatedAt: string }>) => {
        if (Array.isArray(sites) && sites.length > 0) {
          setSites(sites);
          // Restore previously selected site from localStorage, fall back to first
          const savedId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
          const active = (savedId ? sites.find((s) => s.id === savedId) : null) ?? sites[0];
          setCurrentSite(active);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [loaded, setLoaded, setCurrentSite, setSites]);

  return null;
}
