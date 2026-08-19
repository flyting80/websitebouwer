"use client";

import type { BlockType } from "@/lib/types/blocks";
import { createBlock } from "@/lib/types/blocks";
import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  Image as ImageIcon,
  MousePointer,
  Minus,
  Layout,
  Columns,
  Film,
  MessageSquare,
  Grid,
  Quote,
  HelpCircle,
  Maximize,
  AlignLeft,
  Globe,
  Mic2,
  PanelTop,
} from "lucide-react";

export const PALETTE_ITEMS: { type: BlockType; label: string; icon: React.ElementType; description: string }[] = [
  { type: "hero", label: "Hero", icon: Maximize, description: "Grote banner met titel" },
  { type: "navbar", label: "Menubalk", icon: PanelTop, description: "Sleepbaar menu op de pagina" },
  { type: "heading", label: "Kop", icon: Type, description: "Kop 1 t/m 5" },
  { type: "text", label: "Tekst", icon: AlignLeft, description: "Standaard tekst met opmaak" },
  { type: "image", label: "Afbeelding", icon: ImageIcon, description: "Foto of illustratie" },
  { type: "button", label: "Knop", icon: MousePointer, description: "Call-to-action knop" },
  { type: "columns", label: "Kolommen", icon: Columns, description: "2, 3 of 4 kolommen" },
  { type: "section", label: "Sectie", icon: Layout, description: "Container blok" },
  { type: "gallery", label: "Galerij", icon: Grid, description: "Afbeeldingsraster" },
  { type: "card-grid", label: "Kaarten", icon: Layout, description: "Kaart-raster" },
  { type: "contact-form", label: "Formulier", icon: MessageSquare, description: "Contactformulier" },
  { type: "embed", label: "Video", icon: Film, description: "YouTube of Vimeo" },
  { type: "testimonial", label: "Quote", icon: Quote, description: "Getuigenis" },
  { type: "faq", label: "FAQ", icon: HelpCircle, description: "Veelgestelde vragen" },
  { type: "podcast", label: "Podcast", icon: Mic2, description: "Audio-afleveringen" },
  { type: "divider", label: "Lijn", icon: Minus, description: "Horizontale scheiding" },
  { type: "spacer", label: "Ruimte", icon: Globe, description: "Witruimte" },
];

interface Props {
  onAdd: (block: ReturnType<typeof createBlock>) => void;
}

export function BlockPalette({ onAdd }: Props) {
  return (
    <div className="w-52 shrink-0 bg-stone-50 border-r border-stone-200 flex flex-col overflow-hidden">
      <div className="px-3 py-3 border-b border-stone-200">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Blokken</p>
        <p className="text-[11px] text-stone-400 mt-1">Sleep naar een + op de pagina</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {PALETTE_ITEMS.map((item) => (
          <PaletteItem key={item.type} item={item} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}

function PaletteItem({
  item,
  onAdd,
}: {
  item: (typeof PALETTE_ITEMS)[number];
  onAdd: (block: ReturnType<typeof createBlock>) => void;
}) {
  const Icon = item.icon;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${item.type}`,
    data: { source: "palette", type: item.type },
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onAdd(createBlock(item.type))}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-white hover:shadow-sm transition-all group cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
        <Icon size={14} className="text-amber-700" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-700">{item.label}</p>
        <p className="text-xs text-stone-400 truncate">{item.description}</p>
      </div>
    </button>
  );
}
