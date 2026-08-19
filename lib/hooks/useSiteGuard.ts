"use client";
import { useSiteStore, useSiteStoreHydration } from "@/lib/stores/siteStore";

/**
 * Returns { currentSite, ready } where ready is true once the store has hydrated.
 * Use this in admin pages that need a currentSite.
 */
export function useSiteGuard() {
  const { currentSite } = useSiteStore();
  const hydrated = useSiteStoreHydration();
  return { currentSite, ready: hydrated };
}
