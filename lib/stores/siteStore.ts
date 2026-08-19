"use client";
import { create } from "zustand";
import type { Site } from "@/lib/db";

interface SiteStore {
  currentSite: Site | null;
  sites: Site[];
  loaded: boolean;
  setCurrentSite: (site: Site) => void;
  setSites: (sites: Site[]) => void;
  setLoaded: (v: boolean) => void;
}

export const useSiteStore = create<SiteStore>()((set) => ({
  currentSite: null,
  sites: [],
  loaded: false,
  setCurrentSite: (site) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeSiteId", site.id);
    }
    set({ currentSite: site });
  },
  setSites: (sites) => set({ sites }),
  setLoaded: (v) => set({ loaded: v }),
}));

// Stub for backward compat — no-op now (always "hydrated" since no localStorage)
export function useSiteStoreHydration() {
  return true;
}
