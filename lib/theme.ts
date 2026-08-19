import type { SiteTheme, SiteSettings } from "@/lib/db";

export function themeRecord(theme: SiteTheme | null | undefined): Record<string, string> {
  return {
    colorPrimary: theme?.colorPrimary ?? "#d97706",
    colorSecondary: theme?.colorSecondary ?? "#92400e",
    colorAccent: theme?.colorAccent ?? "#fbbf24",
    colorBackground: theme?.colorBackground ?? "#fffbf0",
    colorSurface: theme?.colorSurface ?? "#ffffff",
    colorText: theme?.colorText ?? "#1c1917",
    colorTextMuted: theme?.colorTextMuted ?? "#78716c",
    fontHeading: theme?.fontHeading ?? "serif",
    fontBody: theme?.fontBody ?? "sans-serif",
    logoUrl: theme?.logoUrl ?? "",
  };
}

export function cookieBannerOn(settings: SiteSettings | null | undefined) {
  if (!settings) return true;
  return settings.cookieBannerEnabled !== false;
}
