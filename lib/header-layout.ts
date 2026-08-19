import type { CSSProperties } from "react";
import type { SiteSettings } from "@/lib/db";
import type { Block } from "@/lib/types/blocks";

export type HeaderSlot = "logo" | "nav" | "extra" | "tagline";
export type HeaderZone = "left" | "center" | "right";
export type HeaderZones = Record<HeaderZone, HeaderSlot[]>;
export type HeaderMobileStyle = "drawer" | "bottom-bar";
export type HeaderPosition = "top" | "overlay" | "below-hero" | "in-page";
export type HeaderShadow = "none" | "sm" | "md";
export type HeaderLinkStyle = "plain" | "pill";

export const HEADER_SLOTS: HeaderSlot[] = ["logo", "nav", "extra", "tagline"];

export const HEADER_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Georgia",
];

export const DEFAULT_DESKTOP_ZONES: HeaderZones = {
  left: ["logo"],
  center: [],
  right: ["nav"],
};

export const DEFAULT_MOBILE_ZONES: HeaderZones = {
  left: [],
  center: ["logo"],
  right: ["nav"],
};

export interface HeaderBarStyle {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  hoverColor: string;
  borderColor: string;
  borderWidth: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  height: number;
  radius: number;
  shadow: HeaderShadow;
  transparent: boolean;
  linkStyle: HeaderLinkStyle;
}

export const DEFAULT_HEADER_STYLE: HeaderBarStyle = {
  backgroundColor: "",
  textColor: "",
  linkColor: "",
  hoverColor: "",
  borderColor: "",
  borderWidth: 2,
  fontFamily: "",
  fontSize: 14,
  fontWeight: 500,
  height: 64,
  radius: 0,
  shadow: "sm",
  transparent: false,
  linkStyle: "plain",
};

function isSlot(v: unknown): v is HeaderSlot {
  return v === "logo" || v === "nav" || v === "extra" || v === "tagline";
}

function slotsFrom(value: unknown): HeaderSlot[] {
  if (Array.isArray(value)) return value.filter(isSlot);
  if (isSlot(value)) return [value];
  return [];
}

export function parseHeaderZones(raw: string | null | undefined, fallback: HeaderZones): HeaderZones {
  if (!raw) return { left: [...fallback.left], center: [...fallback.center], right: [...fallback.right] };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      left: slotsFrom(parsed.left),
      center: slotsFrom(parsed.center),
      right: slotsFrom(parsed.right),
    };
  } catch {
    return { left: [...fallback.left], center: [...fallback.center], right: [...fallback.right] };
  }
}

export function serializeHeaderZones(zones: HeaderZones): string {
  return JSON.stringify(zones);
}

export function parseHeaderStyle(raw: string | null | undefined): HeaderBarStyle {
  if (!raw) return { ...DEFAULT_HEADER_STYLE };
  try {
    const parsed = JSON.parse(raw) as Partial<HeaderBarStyle>;
    return { ...DEFAULT_HEADER_STYLE, ...parsed };
  } catch {
    return { ...DEFAULT_HEADER_STYLE };
  }
}

export function serializeHeaderStyle(style: HeaderBarStyle): string {
  return JSON.stringify(style);
}

export function headerEnabled(settings: SiteSettings | null | undefined) {
  if (!settings) return true;
  return settings.headerEnabled !== false;
}

export function headerSticky(settings: SiteSettings | null | undefined) {
  if (!settings) return true;
  return settings.headerSticky !== false;
}

export function headerMobileStyle(settings: SiteSettings | null | undefined): HeaderMobileStyle {
  return settings?.headerMobileStyle === "bottom-bar" ? "bottom-bar" : "drawer";
}

export function headerPosition(settings: SiteSettings | null | undefined): HeaderPosition {
  const v = settings?.headerPosition;
  if (v === "overlay" || v === "below-hero" || v === "in-page" || v === "top") return v;
  return "top";
}

export function desktopZones(settings: SiteSettings | null | undefined): HeaderZones {
  return parseHeaderZones(settings?.headerDesktopLayout, DEFAULT_DESKTOP_ZONES);
}

export function mobileZones(settings: SiteSettings | null | undefined): HeaderZones {
  return parseHeaderZones(settings?.headerMobileLayout, DEFAULT_MOBILE_ZONES);
}

export function headerStyle(settings: SiteSettings | null | undefined): HeaderBarStyle {
  return parseHeaderStyle(settings?.headerStyle);
}

export function zoneAlign(zone: HeaderZone) {
  if (zone === "left") return "justify-start";
  if (zone === "center") return "justify-center";
  return "justify-end";
}

export function headerShadowClass(shadow: HeaderShadow) {
  if (shadow === "md") return "shadow-md";
  if (shadow === "sm") return "shadow-sm";
  return "";
}

export function headerBarCss(style: HeaderBarStyle, theme: Record<string, string>) {
  const color = style.textColor || theme.colorText || "#1c1917";
  const border = style.borderColor || theme.colorPrimary || "#d97706";
  return {
    backgroundColor: style.transparent ? "transparent" : style.backgroundColor || theme.colorSurface || "#ffffff",
    color,
    borderBottom: style.borderWidth > 0 ? `${style.borderWidth}px solid ${border}` : "none",
    fontFamily: style.fontFamily || theme.fontHeading || "serif",
    borderRadius: style.radius ? `${style.radius}px` : undefined,
    ["--header-link" as string]: style.linkColor || color,
    ["--header-hover" as string]: style.hoverColor || `${color}14`,
  } as CSSProperties;
}

export function chromeHeaderInLayout(
  settings: SiteSettings | null | undefined,
  context: "page" | "system"
) {
  if (!headerEnabled(settings)) return false;
  const pos = headerPosition(settings);
  if (pos === "in-page") return context === "system";
  if (pos === "overlay" || pos === "below-hero") return context === "system";
  return pos === "top";
}

export function findHeroIndex(blocks: Block[]) {
  return blocks.findIndex((b) => b.type === "hero");
}
