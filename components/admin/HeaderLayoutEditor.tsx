"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { HEADER_SLOTS, type HeaderSlot, type HeaderZone, type HeaderZones } from "@/lib/header-layout";
import { cn } from "@/lib/utils";

const ZONE_LABELS: Record<HeaderZone, string> = {
  left: "Links",
  center: "Midden",
  right: "Rechts",
};

const CHIP_LABELS: Record<HeaderSlot, string> = {
  logo: "Logo",
  nav: "Navigatie",
  extra: "Extra plaatje",
  tagline: "Tekst",
};

interface Props {
  label: string;
  idPrefix: string;
  zones: HeaderZones;
  onChange: (zones: HeaderZones) => void;
}

export function HeaderLayoutEditor({ label, idPrefix, zones, onChange }: Props) {
  const [activeChip, setActiveChip] = useState<HeaderSlot | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function moveChip(chip: HeaderSlot, toZone: HeaderZone) {
    const next: HeaderZones = {
      left: zones.left.filter((s) => s !== chip),
      center: zones.center.filter((s) => s !== chip),
      right: zones.right.filter((s) => s !== chip),
    };
    next[toZone] = [...next[toZone], chip];
    onChange(next);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveChip(null);
    const chip = event.active.data.current?.chip as HeaderSlot | undefined;
    const zone = event.over?.data.current?.zone as HeaderZone | undefined;
    if (chip && zone) moveChip(chip, zone);
  }

  const placed = new Set([...zones.left, ...zones.center, ...zones.right]);
  const unplaced = HEADER_SLOTS.filter((chip) => !placed.has(chip));

  return (
    <div>
      <p className="text-sm font-semibold text-stone-700 mb-1">{label}</p>
      <p className="text-xs text-stone-400 mb-3">Sleep logo, navigatie, extra plaatje en tekst naar een zone. Meerdere items in één zone staan naast elkaar.</p>

      <DndContext
        sensors={sensors}
        onDragStart={(e: DragStartEvent) => setActiveChip(e.active.data.current?.chip as HeaderSlot)}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-3 gap-2 mb-2">
          {(["left", "center", "right"] as HeaderZone[]).map((zone) => (
            <DropZone key={zone} idPrefix={idPrefix} zone={zone} slots={zones[zone]} />
          ))}
        </div>

        {unplaced.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-[11px] text-stone-400 self-center">Niet geplaatst:</span>
            {unplaced.map((chip) => (
              <DraggableChip key={chip} idPrefix={idPrefix} chip={chip} />
            ))}
          </div>
        )}

        <DragOverlay>
          {activeChip ? <ChipVisual chip={activeChip} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DropZone({ idPrefix, zone, slots }: { idPrefix: string; zone: HeaderZone; slots: HeaderSlot[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${idPrefix}-zone-${zone}`, data: { zone } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] rounded-xl border-2 border-dashed p-2 flex flex-col gap-1",
        isOver ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-stone-50"
      )}
    >
      <p className="text-[10px] font-medium text-stone-400">{ZONE_LABELS[zone]}</p>
      {slots.length === 0 ? (
        <p className="text-[10px] text-stone-300 mt-2">Sleep hierheen</p>
      ) : (
        slots.map((slot) => <DraggableChip key={slot} idPrefix={idPrefix} chip={slot} />)
      )}
    </div>
  );
}

function DraggableChip({ idPrefix, chip }: { idPrefix: string; chip: HeaderSlot }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${idPrefix}-chip-${chip}`,
    data: { chip },
  });

  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <ChipVisual chip={chip} listeners={listeners} attributes={attributes} />
    </div>
  );
}

function ChipVisual({
  chip,
  dragging,
  listeners,
  attributes,
}: {
  chip: HeaderSlot;
  dragging?: boolean;
  listeners?: ReturnType<typeof useDraggable>["listeners"];
  attributes?: ReturnType<typeof useDraggable>["attributes"];
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-medium text-stone-700 shadow-sm",
        dragging && "shadow-md ring-2 ring-amber-300"
      )}
    >
      <button type="button" className="text-stone-300 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </button>
      {CHIP_LABELS[chip]}
    </div>
  );
}
