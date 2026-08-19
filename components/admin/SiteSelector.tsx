"use client";
import { useSiteStore } from "@/lib/stores/siteStore";
import { useEffect } from "react";
import type { Site } from "@/lib/db";

export function SiteSelector({ sites }: { sites: Site[] }) {
  const { setSites, currentSite, setCurrentSite, setLoaded } = useSiteStore();

  useEffect(() => {
    setSites(sites);
    if (!currentSite && sites.length > 0) {
      setCurrentSite(sites[0]);
    }
    setLoaded(true);
  }, [sites, setSites, currentSite, setCurrentSite, setLoaded]);

  return null;
}
