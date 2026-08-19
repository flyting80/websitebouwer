"use client";

import { SiteHeader } from "@/components/site/SiteHeader";
import { useSiteChrome } from "@/components/site/SiteChromeContext";
import type { NavbarBlock } from "@/lib/types/blocks";
import { PanelTop } from "lucide-react";

export function NavbarBlockRender({
  block,
  theme,
  isEditing,
}: {
  block: NavbarBlock;
  theme: Record<string, string>;
  isEditing?: boolean;
}) {
  const chrome = useSiteChrome();

  if (!chrome) {
    return (
      <div className="border border-dashed border-amber-300 bg-amber-50 px-4 py-3 flex items-center gap-2 text-sm text-amber-900">
        <PanelTop size={16} />
        {isEditing ? "Menubalk — sleep dit blok onder de hero. Opmaak stel je in bij Menubalk." : "Menubalk"}
      </div>
    );
  }

  return (
    <SiteHeader
      site={chrome.site}
      theme={chrome.theme ?? theme}
      navItems={chrome.navItems}
      settings={chrome.settings}
      mode={block.props.sticky ? "sticky" : "inline"}
    />
  );
}
