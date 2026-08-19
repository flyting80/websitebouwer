import type { Block } from "@/lib/types/blocks";
import type { NavItem, Site, SiteSettings } from "@/lib/db";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { SiteHeader } from "./SiteHeader";
import { findHeroIndex, headerEnabled, headerPosition } from "@/lib/header-layout";

interface Props {
  blocks: Block[];
  site: Site;
  theme: Record<string, string>;
  navItems: NavItem[];
  settings?: SiteSettings | null;
  emptyLabel?: string;
}

export function SitePageContent({
  blocks,
  site,
  theme,
  navItems,
  settings,
  emptyLabel = "Deze pagina is nog leeg.",
}: Props) {
  const position = headerPosition(settings);
  const inject = headerEnabled(settings) && (position === "overlay" || position === "below-hero");
  const heroIdx = inject ? findHeroIndex(blocks) : -1;

  const header =
    inject && (
      <SiteHeader
        site={site}
        theme={theme}
        navItems={navItems}
        settings={settings}
        mode={position === "overlay" ? "overlay" : "inline"}
      />
    );

  function render(block: Block) {
    return (
      <BlockRenderer
        key={block.id}
        block={block}
        theme={theme}
        siteId={site.id}
        siteSlug={site.slug}
      />
    );
  }

  if (blocks.length === 0) {
    return (
      <>
        {position === "top" ? null : header}
        <div className="flex items-center justify-center min-h-[60vh] text-stone-400">
          <p>{emptyLabel}</p>
        </div>
      </>
    );
  }

  if (!inject || heroIdx < 0) {
    return <>{blocks.map(render)}</>;
  }

  const before = blocks.slice(0, heroIdx);
  const hero = blocks[heroIdx];
  const after = blocks.slice(heroIdx + 1);

  if (position === "overlay") {
    return (
      <>
        {before.map(render)}
        <div className="relative">
          {render(hero)}
          {header}
        </div>
        {after.map(render)}
      </>
    );
  }

  return (
    <>
      {before.map(render)}
      {render(hero)}
      {header}
      {after.map(render)}
    </>
  );
}
