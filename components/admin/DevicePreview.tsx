"use client";

import { useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobilePhoneIframePreview } from "@/components/editor/MobilePhoneFrame";

interface Props {
  src: string;
  initialDevice?: "desktop" | "mobile";
}

export function DevicePreview({ src, initialDevice = "desktop" }: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">(initialDevice);
  const safeSrc = useMemo(() => {
    if (!src.startsWith("/") || src.startsWith("//")) return "/";
    return src;
  }, [src]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-6 bg-stone-200">
      <div className="h-12 bg-white border-b border-stone-200 flex items-center px-4 gap-3 shrink-0">
        <p className="text-sm font-medium text-stone-700">Voorvertoning</p>
        <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
              device === "desktop" ? "bg-white shadow text-stone-800" : "text-stone-500"
            )}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
              device === "mobile" ? "bg-white shadow text-stone-800" : "text-stone-500"
            )}
          >
            <Smartphone size={14} /> Mobiel
          </button>
        </div>
        <p className="text-xs text-stone-400 truncate hidden sm:block">
          {device === "mobile" ? "390 × 760 — scrollbalk naast het telefoonframe" : "Volledige breedte"}
        </p>
        <a href={safeSrc} target="_blank" rel="noreferrer" className="ml-auto text-xs text-amber-700 hover:underline">
          Open in nieuw tabblad
        </a>
      </div>

      <div
        className={cn(
          "flex-1 min-h-0 p-6",
          device === "mobile" ? "flex justify-center items-start overflow-hidden" : "overflow-auto"
        )}
      >
        {device === "mobile" ? (
          <MobilePhoneIframePreview src={safeSrc} />
        ) : (
          <iframe
            title="Desktop preview"
            src={safeSrc}
            className="w-full h-full min-h-[70vh] bg-white rounded-xl border border-stone-300 shadow-lg"
          />
        )}
      </div>
    </div>
  );
}
