"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDndContext,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical, Trash2, Copy, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Block, BlockType, ColumnsBlock, SectionBlock } from "@/lib/types/blocks";
import { createBlock } from "@/lib/types/blocks";
import { BlockRenderer } from "./BlockRenderer";
import { PALETTE_ITEMS } from "./BlockPalette";
import { MobilePhoneFrame } from "./MobilePhoneFrame";
import { applyDrop, duplicateInTree, findBlockInTree, removeBlock } from "@/lib/block-tree";
import { PreviewModeProvider, previewGridCols, usePreviewMode } from "@/lib/preview-mode";
import { cn } from "@/lib/utils";
import {
  DEFAULT_DESKTOP_ZONES,
  DEFAULT_MOBILE_ZONES,
  findHeroIndex,
  type HeaderMobileStyle,
  type HeaderPosition,
  type HeaderSlot,
  type HeaderZone,
  type HeaderZones,
  zoneAlign,
} from "@/lib/header-layout";

const collision: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return closestCenter(args);
};

export function EditorDnd({
  blocks,
  onChange,
  onSelect,
  theme,
  children,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  onSelect: (id: string | null) => void;
  theme: Record<string, string>;
  children: ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    if (String(over.id).startsWith("palette:")) return;
    const result = applyDrop(blocks, String(active.id), String(over.id));
    onChange(result.tree);
    if (result.selectedId) onSelect(result.selectedId);
  }

  const activeBlock = activeId && !activeId.startsWith("palette:")
    ? findBlockInTree(blocks, activeId)
    : null;
  const paletteType = activeId?.startsWith("palette:") ? activeId.slice("palette:".length) : null;
  const paletteLabel = PALETTE_ITEMS.find((i) => i.type === paletteType)?.label;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {paletteLabel && (
          <div className="px-3 py-2 bg-white border-2 border-amber-400 rounded-lg shadow-xl text-sm font-medium text-stone-700">
            {paletteLabel}
          </div>
        )}
        {activeBlock && (
          <div className="opacity-90 shadow-2xl border-2 border-amber-400 rounded bg-white max-w-lg overflow-hidden">
            <BlockRenderer block={activeBlock} theme={theme} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface Props {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  viewMode: "desktop" | "mobile";
  theme: Record<string, string>;
  siteName?: string;
  navPreview?: { label: string }[];
  headerEnabled?: boolean;
  headerDesktopZones?: HeaderZones;
  headerMobileZones?: HeaderZones;
  headerMobileStyle?: HeaderMobileStyle;
  headerPosition?: HeaderPosition;
  headerTagline?: string;
  headerExtraImageUrl?: string;
}

export function EditorCanvas({
  blocks,
  onChange,
  selectedId,
  onSelect,
  viewMode,
  theme,
  siteName,
  navPreview,
  headerEnabled = true,
  headerDesktopZones = DEFAULT_DESKTOP_ZONES,
  headerMobileZones = DEFAULT_MOBILE_ZONES,
  headerMobileStyle = "drawer",
  headerPosition = "top",
  headerTagline = "",
  headerExtraImageUrl = "",
}: Props) {
  function deleteBlock(id: string) {
    const { tree } = removeBlock(blocks, id);
    onChange(tree);
    if (selectedId === id) onSelect(null);
  }

  function duplicateBlock(id: string) {
    const { tree, clone } = duplicateInTree(blocks, id);
    onChange(tree);
    if (clone) onSelect(clone.id);
  }

  function addAt(parentId: string | null, index: number, type: BlockType) {
    const result = applyDrop(blocks, `palette:${type}`, `insert:${parentId ?? "root"}:${index}`);
    onChange(result.tree);
    if (result.selectedId) onSelect(result.selectedId);
  }

  const showHeaderPreview =
    headerEnabled &&
    headerPosition !== "in-page" &&
    Boolean(siteName || (navPreview && navPreview.length > 0));
  const headerAtTop = showHeaderPreview && headerPosition === "top";
  const injectHeaderInCanvas =
    showHeaderPreview && (headerPosition === "below-hero" || headerPosition === "overlay");

  const headerPreviewBar = showHeaderPreview ? (
    <HeaderPreviewBar
      siteName={siteName}
      logoUrl={theme.logoUrl}
      theme={theme}
      navPreview={navPreview}
      viewMode={viewMode}
      zones={viewMode === "mobile" ? headerMobileZones : headerDesktopZones}
      mobileStyle={headerMobileStyle}
      tagline={headerTagline}
      extraImageUrl={headerExtraImageUrl}
      overlay={headerPosition === "overlay"}
    />
  ) : null;

  const canvasBody = (
    <>
      {showHeaderPreview && headerPosition !== "top" && (
        <p className="text-[10px] text-center py-1 bg-amber-50 text-amber-800">
          {headerPosition === "below-hero"
            ? "Live staat deze menubalk onder de hero"
            : "Live ligt deze menubalk over de hero"}
        </p>
      )}
      {headerAtTop && headerPreviewBar}

      <div className={viewMode === "mobile" && headerMobileStyle === "bottom-bar" ? "pb-12" : undefined}>
        {blocks.length === 0 ? (
          <EmptyDrop onAdd={(type) => { const b = createBlock(type); onChange([b]); onSelect(b.id); }} />
        ) : (
          <CanvasList
            parentId={null}
            items={blocks}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
            onAddAt={addAt}
            theme={theme}
            headerPosition={headerPosition}
            headerPreviewBar={injectHeaderInCanvas ? headerPreviewBar : null}
            heroIndex={injectHeaderInCanvas ? findHeroIndex(blocks) : -1}
          />
        )}
      </div>

      {viewMode === "mobile" && headerMobileStyle === "bottom-bar" && navPreview && navPreview.length > 0 && (
        <div
          className="h-10 border-t flex items-stretch text-[9px]"
          style={{
            backgroundColor: theme.colorSurface ?? "#ffffff",
            borderColor: `${theme.colorPrimary ?? "#d97706"}33`,
          }}
        >
          {navPreview.slice(0, 5).map((item, idx) => (
            <span key={`${item.label}-${idx}`} className="flex-1 flex items-center justify-center truncate px-1 font-medium">
              {item.label}
            </span>
          ))}
        </div>
      )}
    </>
  );

  if (viewMode === "mobile") {
    return (
      <PreviewModeProvider mode="mobile">
        <MobilePhoneFrame
          onViewportClick={(e) => {
            if (e.target === e.currentTarget) onSelect(null);
          }}
        >
          {canvasBody}
        </MobilePhoneFrame>
      </PreviewModeProvider>
    );
  }

  return (
    <PreviewModeProvider mode="desktop">
      <div
        className="bg-white min-h-[600px] transition-all mx-auto w-full"
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        {canvasBody}
      </div>
    </PreviewModeProvider>
  );
}

function CanvasList({
  parentId,
  items,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onAddAt,
  theme,
  headerPosition,
  headerPreviewBar,
  heroIndex,
}: {
  parentId: string | null;
  items: Block[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddAt: (parentId: string | null, index: number, type: BlockType) => void;
  theme: Record<string, string>;
  headerPosition?: HeaderPosition;
  headerPreviewBar?: ReactNode;
  heroIndex?: number;
}) {
  const key = parentId ?? "root";
  const injectHeader = parentId === null && headerPreviewBar && heroIndex !== undefined && heroIndex >= 0;
  return (
    <div>
      <InsertPoint id={`insert:${key}:0`} onAdd={(type) => onAddAt(parentId, 0, type)} />
      {items.map((block, index) => (
        <div key={block.id}>
          <CanvasItem
            block={block}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onAddAt={onAddAt}
            theme={theme}
            headerPreviewBar={
              injectHeader && index === heroIndex && headerPosition === "overlay" ? headerPreviewBar : null
            }
          />
          {injectHeader && index === heroIndex && headerPosition === "below-hero" && headerPreviewBar}
          <InsertPoint
            id={`insert:${key}:${index + 1}`}
            onAdd={(type) => onAddAt(parentId, index + 1, type)}
          />
        </div>
      ))}
    </div>
  );
}

function CanvasItem({
  block,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onAddAt,
  theme,
  headerPreviewBar,
}: {
  block: Block;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddAt: (parentId: string | null, index: number, type: BlockType) => void;
  theme: Record<string, string>;
  headerPreviewBar?: ReactNode;
}) {
  const isSelected = selectedId === block.id;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: { source: "block" },
  });
  const style = {
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        isSelected ? "outline outline-2 outline-amber-400" : "hover:outline hover:outline-1 hover:outline-amber-200"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-1 top-2 z-20 p-1 rounded bg-white border border-stone-200 text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing shadow-sm",
          "opacity-70 group-hover:opacity-100",
          isSelected && "opacity-100"
        )}
        title="Slepen om te verplaatsen"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </button>

      {isSelected && (
        <div className="absolute -top-9 left-8 flex gap-1 z-20 bg-white border border-stone-200 rounded-lg shadow-md px-1.5 py-1">
          <span className="text-xs text-stone-400 font-medium px-1 self-center capitalize">{block.type}</span>
          <div className="w-px bg-stone-200 mx-0.5" />
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }} className="p-1 text-stone-500 hover:text-stone-800 rounded" title="Dupliceren">
            <Copy size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} className="p-1 text-red-400 hover:text-red-600 rounded" title="Verwijderen">
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {block.type === "columns" ? (
        <ColumnsEditor
          block={block as ColumnsBlock}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onAddAt={onAddAt}
          theme={theme}
        />
      ) : block.type === "section" ? (
        <SectionEditor
          block={block as SectionBlock}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onAddAt={onAddAt}
          theme={theme}
        />
      ) : headerPreviewBar ? (
        <div className="relative">
          <BlockRenderer
            block={block}
            theme={theme}
            isEditing
            selectedId={selectedId}
            onSelectBlock={onSelect}
          />
          <div className="absolute inset-x-0 top-0 z-10 pointer-events-none">{headerPreviewBar}</div>
        </div>
      ) : (
        <BlockRenderer
          block={block}
          theme={theme}
          isEditing
          selectedId={selectedId}
          onSelectBlock={onSelect}
        />
      )}
    </div>
  );
}

function ColumnsEditor({
  block,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onAddAt,
  theme,
}: {
  block: ColumnsBlock;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddAt: (parentId: string | null, index: number, type: BlockType) => void;
  theme: Record<string, string>;
}) {
  const previewMode = usePreviewMode();
  const gaps = { sm: "gap-4", md: "gap-6", lg: "gap-8" };
  const children = block.children ?? [];

  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-semibold text-amber-800 mb-2">
        Kolommen · sleep blokken naar een kolom
      </p>
      <div
        className={cn(
          "grid",
          gaps[block.props.gap],
          previewGridCols(previewMode, block.props.columns, block.props.stackOnMobile),
        )}
      >
        {children.map((col, i) => (
          <div
            key={col.id}
            className="min-h-[140px] rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(col.id);
            }}
          >
            <p className="text-[10px] uppercase tracking-wide text-amber-700 px-2 py-1">Kolom {i + 1}</p>
            <CanvasList
              parentId={col.id}
              items={col.children ?? []}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onAddAt={onAddAt}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEditor({
  block,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onAddAt,
  theme,
}: {
  block: SectionBlock;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddAt: (parentId: string | null, index: number, type: BlockType) => void;
  theme: Record<string, string>;
}) {
  const maxWidths = { sm: "max-w-sm", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl", full: "max-w-full" };
  const pads = { none: "", sm: "px-4", md: "px-6", lg: "px-8" };
  return (
    <div
      className={cn("mx-auto py-2", maxWidths[block.props.maxWidth], pads[block.props.paddingX])}
      style={block.style ? { backgroundColor: block.style.backgroundColor } : undefined}
    >
      <CanvasList
        parentId={block.id}
        items={block.children ?? []}
        selectedId={selectedId}
        onSelect={onSelect}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onAddAt={onAddAt}
        theme={theme}
      />
    </div>
  );
}

const QUICK_ADDS: BlockType[] = ["heading", "text", "image", "button", "divider", "hero", "columns"];

function InsertPoint({ id, onAdd }: { id: string; onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id });
  const { active } = useDndContext();
  const dragging = Boolean(active);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative z-10 flex justify-center items-center transition-all",
        dragging ? "h-10 my-0.5" : "h-5"
      )}
    >
      {dragging ? (
        <div
          className={cn(
            "w-[calc(100%-2rem)] rounded-lg border-2 border-dashed transition-colors",
            isOver ? "border-amber-500 bg-amber-100 h-10" : "border-amber-200/80 bg-amber-50/60 h-6"
          )}
        >
          <p className={cn("text-center text-[11px] text-amber-800", isOver ? "leading-10 font-medium" : "leading-6")}>
            {isOver ? "Hier invoegen" : "Sleep naar hier of naar een +"}
          </p>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="w-6 h-6 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow opacity-50 hover:opacity-100"
            title="Blok invoegen"
          >
            <Plus size={12} />
          </button>
          {open && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border border-stone-200 rounded-xl shadow-xl p-2 grid grid-cols-3 gap-1 w-52 z-30">
              {QUICK_ADDS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(type);
                    setOpen(false);
                  }}
                  className="text-xs px-2 py-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-800 text-stone-600 capitalize text-center"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyDrop({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: "insert:root:0" });
  const { active } = useDndContext();
  const types: BlockType[] = ["hero", "heading", "text", "image", "columns", "contact-form"];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 m-4 rounded-xl border-2 border-dashed",
        isOver || active ? "border-amber-400 bg-amber-50" : "border-stone-200"
      )}
    >
      <div className="text-center">
        <p className="text-stone-500 font-medium mb-1">
          {isOver ? "Laat los om hier te plaatsen" : "Pagina is nog leeg"}
        </p>
        <p className="text-stone-400 text-sm">Sleep een blok vanuit de lijst links, of klik hieronder</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="px-3 py-2 rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-600 hover:text-amber-800 text-sm transition-colors capitalize"
          >
            + {type}
          </button>
        ))}
      </div>
    </div>
  );
}

function HeaderPreviewBar({
  siteName,
  logoUrl,
  theme,
  navPreview,
  viewMode,
  zones,
  mobileStyle,
  tagline,
  extraImageUrl,
  overlay = false,
}: {
  siteName?: string;
  logoUrl?: string;
  theme: Record<string, string>;
  navPreview?: { label: string }[];
  viewMode: "desktop" | "mobile";
  zones: HeaderZones;
  mobileStyle: HeaderMobileStyle;
  tagline?: string;
  extraImageUrl?: string;
  overlay?: boolean;
}) {
  function slotsIn(zone: HeaderZone): HeaderSlot[] {
    const list = zones[zone] ?? [];
    if (viewMode === "mobile" && mobileStyle === "bottom-bar") {
      return list.filter((s) => s !== "nav");
    }
    return list;
  }

  function renderSlot(slot: string) {
    if (slot === "logo") {
      return logoUrl ? (
        <img key="logo" src={logoUrl} alt="" className="h-6 w-auto max-w-[100px] object-contain" />
      ) : (
        <span key="logo" className="font-bold truncate text-sm" style={{ fontFamily: theme.fontHeading }}>
          {siteName}
        </span>
      );
    }
    if (slot === "tagline" && tagline) {
      return (
        <span key="tagline" className="text-[10px] truncate max-w-[90px] opacity-70">
          {tagline}
        </span>
      );
    }
    if (slot === "extra" && extraImageUrl) {
      return <img key="extra" src={extraImageUrl} alt="" className="h-6 w-auto max-w-[64px] object-contain" />;
    }
    if (slot === "nav") {
      if (viewMode === "mobile") {
        return mobileStyle === "drawer" ? <span key="nav" className="text-stone-400 text-sm">☰</span> : null;
      }
      return (
        <div key="nav" className="flex items-center gap-0.5 overflow-hidden">
          {(navPreview ?? []).slice(0, 4).map((item, idx) => (
            <span key={`${item.label}-${idx}`} className="px-1.5 py-0.5 text-[10px] font-medium rounded whitespace-nowrap">
              {item.label}
            </span>
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={cn(
        "h-14 px-3 grid grid-cols-3 items-center gap-2 border-b-2 shrink-0",
        overlay && "border-b-0 bg-white/90 backdrop-blur-sm"
      )}
      style={{
        backgroundColor: overlay ? undefined : (theme.colorSurface ?? "#ffffff"),
        borderColor: theme.colorPrimary ?? "#d97706",
        color: theme.colorText,
      }}
    >
      {(["left", "center", "right"] as HeaderZone[]).map((zone) => (
        <div key={zone} className={cn("flex items-center gap-1 min-w-0", zoneAlign(zone))}>
          {slotsIn(zone).map((slot) => renderSlot(slot))}
        </div>
      ))}
    </div>
  );
}
