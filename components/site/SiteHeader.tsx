"use client";

import { useState } from "react";
import type { NavItem, Site, SiteSettings } from "@/lib/db";
import { ChevronDown, Menu, X } from "lucide-react";
import { resolveSiteHref } from "@/lib/site-href";
import { inHeaderDesktop, inHeaderMobile, navTree } from "@/lib/nav";
import {
  desktopZones,
  headerBarCss,
  headerMobileStyle,
  headerShadowClass,
  headerSticky,
  headerStyle as readHeaderStyle,
  mobileZones,
  zoneAlign,
  type HeaderBarStyle,
  type HeaderSlot,
  type HeaderZone,
  type HeaderZones,
} from "@/lib/header-layout";
import { cn } from "@/lib/utils";

export type HeaderRenderMode = "sticky" | "inline" | "overlay";

interface Props {
  site: Site;
  theme: Record<string, string>;
  navItems: NavItem[];
  settings?: SiteSettings | null;
  mode?: HeaderRenderMode;
}

export function SiteHeader({ site, theme, navItems, settings, mode }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);

  const desktopTree = navTree(navItems, inHeaderDesktop);
  const mobileTree = navTree(navItems, inHeaderMobile);
  const dZones = desktopZones(settings);
  const mZones = mobileZones(settings);
  const mobileStyle = headerMobileStyle(settings);
  const style = readHeaderStyle(settings);
  const sticky = mode === "sticky" || (mode === undefined && headerSticky(settings));
  const overlay = mode === "overlay";
  const logoUrl = theme.logoUrl || null;
  const extraImageUrl = settings?.headerExtraImageUrl || null;
  const tagline = settings?.headerTagline || "";
  const barCss = headerBarCss(style, theme);
  const height = style.height || 64;

  const wrapClass = cn(
    overlay ? "absolute top-0 left-0 right-0 z-50" : "z-50",
    sticky && !overlay && "sticky top-0",
    headerShadowClass(style.shadow)
  );

  const extras = { extraImageUrl, tagline, style };

  return (
    <>
      <header className={cn("hidden md:block", wrapClass)} style={barCss}>
        <LayoutBar
          site={site}
          theme={theme}
          logoUrl={logoUrl}
          extras={extras}
          zones={dZones}
          tree={desktopTree}
          variant="desktop"
          height={height}
        />
      </header>

      {mobileStyle === "drawer" && (
        <header className={cn("md:hidden", wrapClass)} style={barCss}>
          <LayoutBar
            site={site}
            theme={theme}
            logoUrl={logoUrl}
            extras={extras}
            zones={mZones}
            tree={mobileTree}
            variant="mobile"
            height={height}
            drawerOpen={drawerOpen}
            onToggleDrawer={() => setDrawerOpen((v) => !v)}
            openSub={openSub}
            onToggleSub={(id) => setOpenSub((cur) => (cur === id ? null : id))}
            onCloseDrawer={() => setDrawerOpen(false)}
          />
        </header>
      )}

      {mobileStyle === "bottom-bar" && (
        <>
          <header className={cn("md:hidden", wrapClass)} style={barCss}>
            <LayoutBar
              site={site}
              theme={theme}
              logoUrl={logoUrl}
              extras={extras}
              zones={{
                left: mZones.left.filter((s) => s !== "nav"),
                center: mZones.center.filter((s) => s !== "nav"),
                right: mZones.right.filter((s) => s !== "nav"),
              }}
              tree={mobileTree}
              variant="mobile-minimal"
              height={height}
            />
          </header>
          {!overlay && (
            <MobileBottomBar site={site} theme={theme} tree={mobileTree} style={style} barCss={barCss} />
          )}
        </>
      )}
    </>
  );
}

function LayoutBar({
  site,
  theme,
  logoUrl,
  extras,
  zones,
  tree,
  variant,
  height,
  drawerOpen,
  onToggleDrawer,
  openSub,
  onToggleSub,
  onCloseDrawer,
}: {
  site: Site;
  theme: Record<string, string>;
  logoUrl?: string | null;
  extras: { extraImageUrl: string | null; tagline: string; style: HeaderBarStyle };
  zones: HeaderZones;
  tree: ReturnType<typeof navTree>;
  variant: "desktop" | "mobile" | "mobile-minimal";
  height: number;
  drawerOpen?: boolean;
  onToggleDrawer?: () => void;
  openSub?: string | null;
  onToggleSub?: (id: string) => void;
  onCloseDrawer?: () => void;
}) {
  const isMobile = variant !== "desktop";
  const linkColor = extras.style.linkColor || extras.style.textColor || theme.colorText;

  function renderSlot(slot: HeaderSlot, zone: HeaderZone) {
    if (slot === "logo") {
      return <Logo key="logo" site={site} theme={theme} logoUrl={logoUrl} color={linkColor} font={extras.style.fontFamily} />;
    }
    if (slot === "tagline") {
      if (!extras.tagline) return null;
      return (
        <p
          key="tagline"
          className="text-xs sm:text-sm truncate max-w-[180px] opacity-80"
          style={{ color: linkColor, fontFamily: extras.style.fontFamily || theme.fontBody }}
        >
          {extras.tagline}
        </p>
      );
    }
    if (slot === "extra") {
      if (!extras.extraImageUrl) return null;
      return (
        <img
          key="extra"
          src={extras.extraImageUrl}
          alt=""
          className="h-8 sm:h-10 w-auto max-w-[120px] object-contain"
        />
      );
    }
    if (slot === "nav") {
      if (isMobile && variant === "mobile") {
        return (
          <button
            key="nav"
            type="button"
            className="p-2 rounded-lg hover:bg-black/5"
            onClick={onToggleDrawer}
            aria-label="Menu"
            style={{ color: linkColor }}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        );
      }
      if (isMobile) return null;
      return <DesktopNav key="nav" site={site} theme={theme} tree={tree} align={zone} style={extras.style} />;
    }
    return null;
  }

  return (
    <>
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-3 items-center gap-2"
        style={{ minHeight: height }}
      >
        {(["left", "center", "right"] as HeaderZone[]).map((zone) => (
          <div key={zone} className={cn("flex items-center gap-2 min-w-0 flex-wrap", zoneAlign(zone))}>
            {(zones[zone] ?? []).map((slot) => renderSlot(slot, zone))}
          </div>
        ))}
      </div>

      {variant === "mobile" && drawerOpen && (
        <nav
          className="border-t px-4 py-3 space-y-1"
          style={{ borderColor: `${theme.colorPrimary}33` }}
        >
          <MobileDrawer
            site={site}
            theme={theme}
            tree={tree}
            openSub={openSub ?? null}
            onToggleSub={onToggleSub!}
            onClose={onCloseDrawer!}
            color={linkColor}
          />
        </nav>
      )}
    </>
  );
}

function Logo({
  site,
  theme,
  logoUrl,
  color,
  font,
}: {
  site: Site;
  theme: Record<string, string>;
  logoUrl?: string | null;
  color: string;
  font: string;
}) {
  return (
    <a
      href={`/${site.slug}`}
      className="font-bold text-lg sm:text-xl truncate flex items-center gap-2"
      style={{ fontFamily: font || theme.fontHeading, color }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={site.name} className="h-8 w-auto max-w-[140px] object-contain" />
      ) : (
        site.name
      )}
    </a>
  );
}

function DesktopNav({
  site,
  theme,
  tree,
  align,
  style,
}: {
  site: Site;
  theme: Record<string, string>;
  tree: ReturnType<typeof navTree>;
  align: HeaderZone;
  style: HeaderBarStyle;
}) {
  const color = style.linkColor || style.textColor || theme.colorText;
  const pill = style.linkStyle === "pill";
  return (
    <nav
      className={cn(
        "flex items-center gap-1 flex-wrap",
        align === "center" && "justify-center",
        align === "right" && "justify-end"
      )}
    >
      {tree.map(({ item, children }) => (
        <div key={item.id} className="relative group">
          <a
            href={resolveSiteHref(site.slug, item.href)}
            target={item.openInNewTab ? "_blank" : undefined}
            rel={item.openInNewTab ? "noreferrer" : undefined}
            className={cn(
              "px-3 py-2 text-sm inline-flex items-center gap-1 transition-colors",
              pill ? "rounded-full hover:bg-black/10" : "rounded-lg hover:bg-black/5"
            )}
            style={{
              color,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              fontFamily: style.fontFamily || undefined,
            }}
          >
            {item.label}
            {children.length > 0 && <ChevronDown size={14} />}
          </a>
          {children.length > 0 && (
            <div className="absolute left-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
              <div className="min-w-[180px] bg-white border border-stone-200 rounded-xl shadow-lg py-1">
                {children.map((child) => (
                  <a
                    key={child.id}
                    href={resolveSiteHref(site.slug, child.href)}
                    target={child.openInNewTab ? "_blank" : undefined}
                    rel={child.openInNewTab ? "noreferrer" : undefined}
                    className="block px-3 py-2 text-sm hover:bg-stone-50"
                    style={{ color: theme.colorText }}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function MobileDrawer({
  site,
  theme,
  tree,
  openSub,
  onToggleSub,
  onClose,
  color,
}: {
  site: Site;
  theme: Record<string, string>;
  tree: ReturnType<typeof navTree>;
  openSub: string | null;
  onToggleSub: (id: string) => void;
  onClose: () => void;
  color: string;
}) {
  return (
    <>
      {tree.map(({ item, children }) => (
        <div key={item.id}>
          <div className="flex items-center">
            <a
              href={resolveSiteHref(site.slug, item.href)}
              onClick={onClose}
              className="flex-1 block px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5"
              style={{ color }}
            >
              {item.label}
            </a>
            {children.length > 0 && (
              <button type="button" className="p-2" onClick={() => onToggleSub(item.id)} aria-label="Submenu">
                <ChevronDown size={16} className={openSub === item.id ? "rotate-180" : ""} />
              </button>
            )}
          </div>
          {children.length > 0 && openSub === item.id && (
            <div className="pl-4">
              {children.map((child) => (
                <a
                  key={child.id}
                  href={resolveSiteHref(site.slug, child.href)}
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg text-sm hover:bg-black/5"
                  style={{ color }}
                >
                  {child.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function MobileBottomBar({
  site,
  theme,
  tree,
  style,
  barCss,
}: {
  site: Site;
  theme: Record<string, string>;
  tree: ReturnType<typeof navTree>;
  style: HeaderBarStyle;
  barCss: ReturnType<typeof headerBarCss>;
}) {
  if (tree.length === 0) return null;
  const color = style.linkColor || style.textColor || theme.colorText;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
      style={{ ...barCss, borderRadius: 0 }}
    >
      <div className="flex justify-around items-stretch max-w-lg mx-auto">
        {tree.slice(0, 5).map(({ item }) => (
          <a
            key={item.id}
            href={resolveSiteHref(site.slug, item.href)}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-medium min-w-0"
            style={{ color }}
          >
            <span className="truncate max-w-full px-1">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
