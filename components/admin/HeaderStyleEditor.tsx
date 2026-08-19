"use client";

import { HEADER_FONTS, type HeaderBarStyle, type HeaderLinkStyle, type HeaderShadow } from "@/lib/header-layout";

interface Props {
  style: HeaderBarStyle;
  onChange: (style: HeaderBarStyle) => void;
}

export function HeaderStyleEditor({ style, onChange }: Props) {
  function set<K extends keyof HeaderBarStyle>(key: K, value: HeaderBarStyle[K]) {
    onChange({ ...style, [key]: value });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-stone-700">Opmaak</p>
      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Achtergrond" value={style.backgroundColor} placeholder="#ffffff" onChange={(v) => set("backgroundColor", v)} />
        <ColorField label="Tekst / logo" value={style.textColor} placeholder="#1c1917" onChange={(v) => set("textColor", v)} />
        <ColorField label="Menu-links" value={style.linkColor} placeholder="" onChange={(v) => set("linkColor", v)} />
        <ColorField label="Randkleur" value={style.borderColor} placeholder="" onChange={(v) => set("borderColor", v)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={style.transparent} onChange={(e) => set("transparent", e.target.checked)} className="accent-amber-600" />
        Transparante achtergrond (handig over een hero)
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-stone-600">
          Lettertype
          <select
            value={style.fontFamily}
            onChange={(e) => set("fontFamily", e.target.value)}
            className="mt-1 w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
          >
            <option value="">Thema (kop)</option>
            {HEADER_FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-stone-600">
          Lettergrootte (px)
          <input
            type="number"
            min={11}
            max={22}
            value={style.fontSize}
            onChange={(e) => set("fontSize", Number(e.target.value) || 14)}
            className="mt-1 w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
          />
        </label>
        <label className="text-xs text-stone-600">
          Letterdikte
          <select
            value={String(style.fontWeight)}
            onChange={(e) => set("fontWeight", Number(e.target.value))}
            className="mt-1 w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
          >
            <option value="400">Normaal</option>
            <option value="500">Medium</option>
            <option value="600">Semi-vet</option>
            <option value="700">Vet</option>
          </select>
        </label>
        <label className="text-xs text-stone-600">
          Hoogte (px)
          <input
            type="number"
            min={48}
            max={120}
            value={style.height}
            onChange={(e) => set("height", Number(e.target.value) || 64)}
            className="mt-1 w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
          />
        </label>
        <label className="text-xs text-stone-600">
          Randdikte (px)
          <input
            type="number"
            min={0}
            max={6}
            value={style.borderWidth}
            onChange={(e) => set("borderWidth", Number(e.target.value) || 0)}
            className="mt-1 w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
          />
        </label>
        <label className="text-xs text-stone-600">
          Afronding (px)
          <input
            type="number"
            min={0}
            max={32}
            value={style.radius}
            onChange={(e) => set("radius", Number(e.target.value) || 0)}
            className="mt-1 w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
          />
        </label>
      </div>
      <div className="flex gap-2">
        {([
          { value: "plain", label: "Platte links" },
          { value: "pill", label: "Afgeronde knoppen" },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => set("linkStyle", value as HeaderLinkStyle)}
            className={`flex-1 text-xs py-2 rounded-lg border ${
              style.linkStyle === value
                ? "border-amber-500 bg-amber-50 text-amber-900 font-medium"
                : "border-stone-200 text-stone-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {([
          { value: "none", label: "Geen schaduw" },
          { value: "sm", label: "Licht" },
          { value: "md", label: "Sterk" },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => set("shadow", value as HeaderShadow)}
            className={`flex-1 text-xs py-2 rounded-lg border ${
              style.shadow === value
                ? "border-amber-500 bg-amber-50 text-amber-900 font-medium"
                : "border-stone-200 text-stone-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-xs text-stone-600">
      {label}
      <div className="mt-1 flex gap-1">
        <input
          type="color"
          value={value && value.startsWith("#") ? value : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded border border-stone-200 cursor-pointer bg-white"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Thema"}
          className="flex-1 px-2 py-1 border border-stone-300 rounded-lg text-sm"
        />
      </div>
    </label>
  );
}
