"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** live = echte site (viewport breakpoints); editor = geforceerde breakpoint */
export type PreviewMode = "live" | "desktop" | "mobile";

const PreviewModeContext = createContext<PreviewMode>("live");

export function PreviewModeProvider({
  mode,
  children,
}: {
  mode: PreviewMode;
  children: ReactNode;
}) {
  return <PreviewModeContext.Provider value={mode}>{children}</PreviewModeContext.Provider>;
}

export function usePreviewMode(): PreviewMode {
  return useContext(PreviewModeContext);
}

export function toPreviewMode(viewMode: "desktop" | "mobile"): PreviewMode {
  return viewMode === "mobile" ? "mobile" : "desktop";
}

/**
 * Kies mobile- of desktop-stijlen op basis van previewMode.
 * live: mobile-klassen + md:-prefixed desktop (Tailwind viewport).
 */
export function previewResponsive(
  mode: PreviewMode,
  mobile: string,
  desktop: string,
): string {
  if (mode === "mobile") return mobile;
  if (mode === "desktop") return desktop;
  const mdPrefixed = desktop
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => (c.startsWith("md:") ? c : `md:${c}`))
    .join(" ");
  return cn(mobile, mdPrefixed);
}

/** Grid-kolommen voor columns / card-grid (met stackOnMobile). */
export function previewGridCols(
  mode: PreviewMode,
  count: 2 | 3 | 4,
  stackOnMobile = true,
): string {
  const desktop = `grid-cols-${count}`;
  if (!stackOnMobile) {
    return previewResponsive(mode, desktop, desktop);
  }
  return previewResponsive(mode, "grid-cols-1", desktop);
}

const HEADING_SIZE: Record<number, { mobile: string; desktop: string }> = {
  1: { mobile: "text-4xl leading-tight", desktop: "text-5xl leading-tight" },
  2: { mobile: "text-3xl leading-snug", desktop: "text-4xl leading-snug" },
  3: { mobile: "text-2xl", desktop: "text-3xl" },
  4: { mobile: "text-xl", desktop: "text-2xl" },
  5: { mobile: "text-lg", desktop: "text-xl" },
};

export function previewHeadingSize(mode: PreviewMode, level: number): string {
  const sizes = HEADING_SIZE[level] ?? HEADING_SIZE[2];
  return previewResponsive(mode, sizes.mobile, sizes.desktop);
}
