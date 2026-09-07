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

/** Equal-width grid classes (static Tailwind — safe for JIT). */
export function previewGridCols(
  mode: PreviewMode,
  count: 2 | 3 | 4,
  stackOnMobile = true,
): string {
  const desktop =
    count === 2 ? "grid-cols-2" : count === 3 ? "grid-cols-3" : "grid-cols-4";
  if (!stackOnMobile) {
    return previewResponsive(mode, desktop, desktop);
  }
  return previewResponsive(mode, "grid-cols-1", desktop);
}

/** Relative column widths as CSS grid-template-columns value. */
export function columnTemplate(count: number, widths?: number[]): string {
  const safe =
    widths && widths.length === count
      ? widths.map((w) => Math.max(1, Number(w) || 1))
      : Array.from({ length: count }, () => 1);
  return safe.map((w) => `minmax(0, ${w}fr)`).join(" ");
}

/**
 * Layout for columns blocks: use inline gridTemplateColumns (Tailwind cannot see
 * dynamic arbitrary classes like grid-cols-[1fr_2fr]).
 */
export function columnLayout(
  mode: PreviewMode,
  count: 2 | 3 | 4,
  stackOnMobile = true,
  widths?: number[],
): { className: string; style?: { gridTemplateColumns: string } } {
  const template = columnTemplate(count, widths);
  if (mode === "mobile" && stackOnMobile) {
    return { className: "grid grid-cols-1" };
  }
  if (mode === "desktop" || !stackOnMobile) {
    return { className: "grid", style: { gridTemplateColumns: template } };
  }
  // live: desktop widths + force single column under md
  return {
    className: "grid max-md:![grid-template-columns:minmax(0,1fr)]",
    style: { gridTemplateColumns: template },
  };
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
