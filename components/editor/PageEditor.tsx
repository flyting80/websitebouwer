"use client";

import { useState, useEffect, useRef } from "react";
import { BlockPalette } from "./BlockPalette";
import { EditorCanvas, EditorDnd } from "./EditorCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import type { Block } from "@/lib/types/blocks";
import type { Page, Site, SiteTheme, NavItem, SiteSettings } from "@/lib/db";
import { Monitor, Smartphone, Eye, Save, Globe, ChevronLeft, Undo2, Redo2, Copy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { inHeaderDesktop, inHeaderMobile, navTree } from "@/lib/nav";
import {
  desktopZones,
  headerEnabled,
  headerMobileStyle,
  headerPosition,
  mobileZones,
} from "@/lib/header-layout";
import { SiteChromeProvider } from "@/components/site/SiteChromeContext";
import { cloneBlocksWithNewIds } from "@/lib/block-tree";
import { parseBlocks } from "@/lib/page-blocks";

interface Props {
  page: Page;
  site: Site;
  theme: SiteTheme;
}

function findBlock(blocks: Block[], id: string | null): Block | null {
  if (!id) return null;
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateBlockInTree(blocks: Block[], updated: Block): Block[] {
  return blocks.map((block) => {
    if (block.id === updated.id) return updated;
    if (block.children) {
      return { ...block, children: updateBlockInTree(block.children, updated) };
    }
    return block;
  });
}

type SaveState = "idle" | "saving" | "saved" | "error";
type DeviceMode = "desktop" | "mobile";

function emptyHistory(blocks: Block[]) {
  return { stack: [structuredClone(blocks)] as Block[][], index: 0 };
}

export function PageEditor({ page, site, theme }: Props) {
  const initialDesktop = parseBlocks(page.draftBlocks);
  const initialMobile = parseBlocks(page.draftBlocksMobile);
  const [desktopBlocks, setDesktopBlocks] = useState<Block[]>(initialDesktop);
  const [mobileBlocks, setMobileBlocks] = useState<Block[]>(initialMobile);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<DeviceMode>("desktop");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isPublishing, setIsPublishing] = useState(false);
  const [navPreview, setNavPreview] = useState<{ label: string }[]>([]);
  const [navPreviewMobile, setNavPreviewMobile] = useState<{ label: string }[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings>>({});
  const [seo, setSeo] = useState({
    title: page.seoTitle ?? "",
    description: page.seoDescription ?? "",
    image: page.seoImage ?? "",
  });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [publishedBanner, setPublishedBanner] = useState(false);

  const historyRef = useRef({
    desktop: emptyHistory(initialDesktop),
    mobile: emptyHistory(initialMobile),
  });
  const skipHistory = useRef(false);
  const seoReady = useRef(false);
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const blocks = viewMode === "mobile" ? mobileBlocks : desktopBlocks;
  function setBlocks(next: Block[] | ((prev: Block[]) => Block[])) {
    const apply = (prev: Block[]) => (typeof next === "function" ? next(prev) : next);
    if (viewMode === "mobile") setMobileBlocks(apply);
    else setDesktopBlocks(apply);
  }

  const themeRecord: Record<string, string> = {
    colorPrimary: theme?.colorPrimary ?? "#d97706",
    colorSecondary: theme?.colorSecondary ?? "#92400e",
    colorAccent: theme?.colorAccent ?? "#fbbf24",
    colorBackground: theme?.colorBackground ?? "#fffbf0",
    colorSurface: theme?.colorSurface ?? "#ffffff",
    colorText: theme?.colorText ?? "#1c1917",
    colorTextMuted: theme?.colorTextMuted ?? "#78716c",
    fontHeading: theme?.fontHeading ?? "serif",
    fontBody: theme?.fontBody ?? "sans-serif",
  };

  const selectedBlock = findBlock(blocks, selectedId);
  const previewHref =
    page.pageType === "home" || !page.slug ? `/${site.slug}/preview` : `/${site.slug}/preview/${page.slug}`;
  const liveHref =
    page.pageType === "home" || !page.slug ? `/${site.slug}` : `/${site.slug}/${page.slug}`;

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/nav?siteId=${site.id}`).then((r) => r.json()),
      fetch(`/api/admin/settings?siteId=${site.id}`).then((r) => r.json()),
    ])
      .then(([navData, settingsData]) => {
        if (Array.isArray(navData)) {
          setNavItems(navData as NavItem[]);
          const desktop = navTree(navData as NavItem[], inHeaderDesktop).map(({ item }) => ({ label: item.label }));
          const mobile = navTree(navData as NavItem[], inHeaderMobile).map(({ item }) => ({ label: item.label }));
          setNavPreview(desktop);
          setNavPreviewMobile(mobile);
        }
        if (settingsData && typeof settingsData === "object") {
          setSiteSettings(settingsData);
        }
      })
      .catch(() => {});
  }, [site.id]);

  useEffect(() => {
    if (skipHistory.current) {
      skipHistory.current = false;
      return;
    }
    const mode = viewModeRef.current;
    const current = mode === "mobile" ? mobileBlocks : desktopBlocks;
    const timeout = setTimeout(() => {
      const hist = historyRef.current[mode];
      const last = hist.stack[hist.index];
      if (JSON.stringify(last) === JSON.stringify(current)) return;
      const trimmed = hist.stack.slice(0, hist.index + 1);
      trimmed.push(structuredClone(current));
      if (trimmed.length > 50) trimmed.shift();
      hist.stack = trimmed;
      hist.index = trimmed.length - 1;
      setCanUndo(hist.index > 0);
      setCanRedo(false);
    }, 450);
    return () => clearTimeout(timeout);
  }, [desktopBlocks, mobileBlocks, viewMode]);

  useEffect(() => {
    if (saveState === "saving") return;
    const timeout = setTimeout(() => save(), 1500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopBlocks, mobileBlocks]);

  useEffect(() => {
    if (!seoReady.current) {
      seoReady.current = true;
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seoTitle: seo.title || null,
          seoDescription: seo.description || null,
          seoImage: seo.image || null,
        }),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [seo, page.id]);

  // Keep a stable ref to the latest undo/redo so the keyboard handler never
  // captures a stale closure (undo/redo read viewMode which changes over time).
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  useEffect(() => { undoRef.current = undo; });
  useEffect(() => { redoRef.current = redo; });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redoRef.current();
        else undoRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redoRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function save() {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftBlocks: desktopBlocks,
          draftBlocksMobile: mobileBlocks,
          seoTitle: seo.title || null,
          seoDescription: seo.description || null,
          seoImage: seo.image || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }

  async function publish() {
    setIsPublishing(true);
    await save();
    const res = await fetch(`/api/admin/pages/${page.id}/publish`, { method: "POST" });
    setIsPublishing(false);
    if (res.ok) {
      setPublishedBanner(true);
      setTimeout(() => setPublishedBanner(false), 3500);
    }
  }

  function updateBlock(updated: Block) {
    setBlocks((bs) => updateBlockInTree(bs, updated));
  }

  function undo() {
    const hist = historyRef.current[viewMode];
    if (hist.index <= 0) return;
    hist.index -= 1;
    skipHistory.current = true;
    const next = structuredClone(hist.stack[hist.index]);
    if (viewMode === "mobile") setMobileBlocks(next);
    else setDesktopBlocks(next);
    setCanUndo(hist.index > 0);
    setCanRedo(true);
  }

  function redo() {
    const hist = historyRef.current[viewMode];
    if (hist.index >= hist.stack.length - 1) return;
    hist.index += 1;
    skipHistory.current = true;
    const next = structuredClone(hist.stack[hist.index]);
    if (viewMode === "mobile") setMobileBlocks(next);
    else setDesktopBlocks(next);
    setCanUndo(true);
    setCanRedo(hist.index < hist.stack.length - 1);
  }

  function switchView(mode: DeviceMode) {
    setViewMode(mode);
    setSelectedId(null);
    const hist = historyRef.current[mode];
    setCanUndo(hist.index > 0);
    setCanRedo(hist.index < hist.stack.length - 1);
  }

  function copyDesktopToMobile() {
    const cloned = cloneBlocksWithNewIds(desktopBlocks);
    skipHistory.current = true;
    setMobileBlocks(cloned);
    historyRef.current.mobile = emptyHistory(cloned);
    setCanUndo(false);
    setCanRedo(false);
    setSelectedId(null);
  }

  function clearMobileLayout() {
    if (!confirm("Mobiele layout wissen? Bezoekers zien dan weer de desktopversie (responsive).")) return;
    skipHistory.current = true;
    setMobileBlocks([]);
    historyRef.current.mobile = emptyHistory([]);
    setSelectedId(null);
  }

  return (
    <SiteChromeProvider value={{ site, theme: themeRecord, navItems, settings: siteSettings as SiteSettings }}>
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-6 overflow-hidden">
      {publishedBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none">
          <Globe size={15} />
          Pagina is gepubliceerd!
        </div>
      )}
      <div className="h-12 bg-white border-b border-stone-200 flex items-center px-3 gap-2 shrink-0">
        <Link href="/admin/pages" className="text-stone-400 hover:text-stone-700 transition-colors">
          <ChevronLeft size={18} />
        </Link>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <span className="text-sm font-medium text-stone-700 truncate max-w-[180px]">{page.title}</span>
        <span className="text-stone-400 text-sm">— {site.name}</span>

        <div className="flex-1" />

        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 disabled:opacity-30"
          title="Ongedaan maken (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 disabled:opacity-30"
          title="Opnieuw (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>

        <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => switchView("desktop")}
            className={cn("flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors", viewMode === "desktop" ? "bg-white shadow text-stone-700" : "text-stone-400 hover:text-stone-600")}
          >
            <Monitor size={15} /> Desktop
          </button>
          <button
            type="button"
            onClick={() => switchView("mobile")}
            className={cn("flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors", viewMode === "mobile" ? "bg-white shadow text-stone-700" : "text-stone-400 hover:text-stone-600")}
          >
            <Smartphone size={15} /> Mobiel
            {mobileBlocks.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          </button>
        </div>

        {viewMode === "mobile" && (
          <>
            <button
              type="button"
              onClick={copyDesktopToMobile}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-50"
              title="Kopieer de desktop-layout als startpunt"
            >
              <Copy size={12} /> Van desktop
            </button>
            {mobileBlocks.length > 0 && (
              <button type="button" onClick={clearMobileLayout} className="text-xs text-stone-400 hover:text-red-600">
                Wis mobiel
              </button>
            )}
          </>
        )}

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <span className={cn("text-xs", saveState === "saved" ? "text-green-600" : saveState === "saving" ? "text-amber-500" : saveState === "error" ? "text-red-500" : "text-stone-400")}>
          {saveState === "saved" ? "✓ Opgeslagen" : saveState === "saving" ? "Opslaan..." : saveState === "error" ? "Fout bij opslaan" : viewMode === "mobile" ? "Mobiel concept" : "Concept"}
        </span>

        <Link
          href={`/admin/preview?path=${encodeURIComponent(previewHref)}&device=desktop`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-800 hover:text-amber-950 border border-amber-200 bg-amber-50 rounded-lg transition-colors"
        >
          <Eye size={13} />
          Preview
        </Link>

        <Link
          href={liveHref}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg transition-colors"
        >
          Live
        </Link>

        <button
          onClick={save}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg transition-colors"
        >
          <Save size={13} />
          Opslaan
        </button>

        <button
          onClick={publish}
          disabled={isPublishing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors disabled:opacity-60 font-medium"
        >
          <Globe size={13} />
          {isPublishing ? "Publiceren..." : "Publiceren"}
        </button>
      </div>

      <EditorDnd blocks={blocks} onChange={setBlocks} onSelect={setSelectedId} theme={themeRecord}>
      <div className="flex-1 flex overflow-hidden">
        <BlockPalette onAdd={(block) => { setBlocks((bs) => [...bs, block]); setSelectedId(block.id); }} />

        <div
          className={cn(
            "flex-1 bg-stone-100 p-4",
            viewMode === "mobile"
              ? "flex flex-col items-center overflow-hidden min-h-0"
              : "overflow-auto"
          )}
        >
          {viewMode === "mobile" && (
            <div className="max-w-[390px] mx-auto mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              {mobileBlocks.length === 0
                ? "Nog geen aparte mobiele layout — bezoekers zien de desktopversie. Klik op “Van desktop” om te beginnen, of sleep blokken."
                : "Je bewerkt de mobiele afgeleide. Deze mag afwijken van desktop."}
            </div>
          )}
          <EditorCanvas
            blocks={blocks}
            onChange={setBlocks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            viewMode={viewMode}
            theme={themeRecord}
            siteName={site.name}
            navPreview={viewMode === "mobile" ? navPreviewMobile : navPreview}
            headerEnabled={headerEnabled(siteSettings as SiteSettings)}
            headerDesktopZones={desktopZones(siteSettings as SiteSettings)}
            headerMobileZones={mobileZones(siteSettings as SiteSettings)}
            headerMobileStyle={headerMobileStyle(siteSettings as SiteSettings)}
            headerPosition={headerPosition(siteSettings as SiteSettings)}
            headerTagline={siteSettings.headerTagline ?? ""}
            headerExtraImageUrl={siteSettings.headerExtraImageUrl ?? ""}
          />
        </div>

        <PropertiesPanel
          block={selectedBlock}
          onChange={updateBlock}
          onClose={() => setSelectedId(null)}
          seo={seo}
          onSeoChange={setSeo}
        />
      </div>
      </EditorDnd>
    </div>
    </SiteChromeProvider>
  );
}
