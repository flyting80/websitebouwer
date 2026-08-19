import type { ReactNode } from "react";
import type { Site, NavItem, SiteSettings } from "@/lib/db";
import { SiteHeader } from "./SiteHeader";
import { CookieBanner } from "./CookieBanner";
import { resolveSiteHref } from "@/lib/site-href";
import { inFooter, navTree } from "@/lib/nav";
import { cookieBannerOn } from "@/lib/theme";
import { chromeHeaderInLayout, headerMobileStyle, headerPosition } from "@/lib/header-layout";
import { SiteChromeProvider } from "./SiteChromeContext";

interface Props {
  site: Site;
  theme: Record<string, string>;
  navItems: NavItem[];
  settings?: SiteSettings | null;
  preview?: boolean;
  /** page = page builder; system = blog/podcast without blocks */
  headerContext?: "page" | "system";
  children: ReactNode;
}

export function SiteLayout({
  site,
  theme,
  navItems,
  settings,
  preview,
  headerContext = "page",
  children,
}: Props) {
  const footerTree = navTree(navItems, inFooter);
  const showHeader = chromeHeaderInLayout(settings, headerContext);
  const mobileBottomBar = headerMobileStyle(settings) === "bottom-bar";
  const pos = headerPosition(settings);
  const padBottom = mobileBottomBar && pos !== "in-page";

  return (
    <SiteChromeProvider value={{ site, theme, navItems, settings }}>
      <div style={{ backgroundColor: theme.colorBackground, fontFamily: theme.fontBody, color: theme.colorText, minHeight: "100vh" }}>
        {preview && (
          <div className="bg-amber-500 text-white text-center text-sm py-2 px-4">
            Je bekijkt een concept. Bezoekers zien deze versie niet totdat je publiceert.
          </div>
        )}
        {showHeader && (
          <SiteHeader site={site} theme={theme} navItems={navItems} settings={settings} />
        )}

        <main className={padBottom ? "pb-16 md:pb-0" : undefined}>{children}</main>

        <footer style={{ backgroundColor: theme.colorText, color: "#fff" }} className="mt-16">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="font-bold text-lg" style={{ fontFamily: theme.fontHeading }}>{site.name}</p>
                {settings?.footerText && (
                  <p className="text-sm opacity-70 mt-2 max-w-sm">{settings.footerText}</p>
                )}
                {site.contactEmail && (
                  <a href={`mailto:${site.contactEmail}`} className="text-sm opacity-70 hover:opacity-100 mt-2 block">
                    {site.contactEmail}
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-4 min-w-[160px]">
                <p className="text-xs uppercase tracking-wider opacity-50">Menu</p>
                {footerTree.length === 0 && (
                  <p className="text-sm opacity-50">Geen footer-links. Stel ze in via Menubalk.</p>
                )}
                {footerTree.map(({ item, children: kids }) => (
                  <div key={item.id}>
                    <a href={resolveSiteHref(site.slug, item.href)} className="text-sm opacity-80 hover:opacity-100">
                      {item.label}
                    </a>
                    {kids.length > 0 && (
                      <div className="mt-1 pl-3 space-y-1">
                        {kids.map((child) => (
                          <a
                            key={child.id}
                            href={resolveSiteHref(site.slug, child.href)}
                            className="block text-sm opacity-60 hover:opacity-100"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 mt-6 pt-4 text-xs opacity-40 flex justify-between">
              <span>© {new Date().getFullYear()} {site.name}</span>
              <span>Gemaakt met Saf4</span>
            </div>
          </div>
        </footer>

        <CookieBanner
          siteId={site.id}
          siteSlug={site.slug}
          enabled={!preview && cookieBannerOn(settings)}
          primaryColor={theme.colorPrimary}
        />
      </div>
    </SiteChromeProvider>
  );
}
