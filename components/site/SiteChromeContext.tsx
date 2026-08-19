"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { NavItem, Site, SiteSettings } from "@/lib/db";

export interface SiteChromeValue {
  site: Site;
  theme: Record<string, string>;
  navItems: NavItem[];
  settings?: SiteSettings | null;
}

const SiteChromeContext = createContext<SiteChromeValue | null>(null);

export function SiteChromeProvider({
  value,
  children,
}: {
  value: SiteChromeValue;
  children: ReactNode;
}) {
  return <SiteChromeContext.Provider value={value}>{children}</SiteChromeContext.Provider>;
}

export function useSiteChrome() {
  return useContext(SiteChromeContext);
}
