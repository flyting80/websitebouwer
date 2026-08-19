import type { Block } from "@/lib/types/blocks";
import type { NavItem, Site, SiteSettings } from "@/lib/db";
import { SitePageContent } from "./SitePageContent";
import { pageHasMobileLayout } from "@/lib/page-blocks";

interface Props {
  desktopBlocks: Block[];
  mobileBlocks?: Block[];
  site: Site;
  theme: Record<string, string>;
  navItems: NavItem[];
  settings?: SiteSettings | null;
  emptyLabel?: string;
}

export function ResponsivePageContent({
  desktopBlocks,
  mobileBlocks = [],
  site,
  theme,
  navItems,
  settings,
  emptyLabel,
}: Props) {
  const shared = { site, theme, navItems, settings, emptyLabel };
  if (!pageHasMobileLayout(mobileBlocks)) {
    return <SitePageContent blocks={desktopBlocks} {...shared} />;
  }

  return (
    <>
      <div className="max-md:hidden">
        <SitePageContent blocks={desktopBlocks} {...shared} />
      </div>
      <div className="md:hidden">
        <SitePageContent blocks={mobileBlocks} {...shared} />
      </div>
    </>
  );
}
