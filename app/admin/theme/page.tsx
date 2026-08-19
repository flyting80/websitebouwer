"use client";
import { useEffect, useState } from "react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { SiteTheme } from "@/lib/db";
import { Save } from "lucide-react";

const FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Nunito",
  "Playfair Display", "Merriweather", "Lora", "Georgia",
];

export default function ThemePage() {
  const { currentSite, loaded } = useSiteStore(); 
  const [theme, setTheme] = useState<Partial<SiteTheme>>({
    colorPrimary: "#d97706",
    colorSecondary: "#92400e",
    colorAccent: "#fbbf24",
    colorBackground: "#fffbf0",
    colorSurface: "#ffffff",
    colorText: "#1c1917",
    colorTextMuted: "#78716c",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    borderRadius: "0.5rem",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loaded || !currentSite) return;
    fetch(`/api/admin/theme?siteId=${currentSite.id}`)
      .then((r) => r.json())
      .then((data) => { if (data && !data.error) setTheme(data); });
  }, [loaded, currentSite]);

  async function save() {
    if (!loaded || !currentSite) return;
    setSaving(true);
    const res = await fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: currentSite.id, ...theme }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  function set(key: keyof SiteTheme, value: string) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Thema</h1>
          <p className="text-stone-500 text-sm">Kleuren, fonts en stijl voor {currentSite.name}</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          <Save size={16} />
          {saved ? "Opgeslagen ✓" : saving ? "Opslaan..." : "Opslaan"}
        </button>
      </div>

      <div className="grid gap-4">
        {/* Preview */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-stone-100 text-xs text-stone-400 font-medium">Voorbeeld</div>
          <div className="p-6" style={{ backgroundColor: theme.colorBackground, fontFamily: theme.fontBody }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colorText, fontFamily: theme.fontHeading }}>
              Voorbeeldkop
            </h2>
            <p className="text-sm mb-4" style={{ color: theme.colorTextMuted }}>
              Dit is een voorbeeldtekst om de stijl te tonen.
            </p>
            <button className="px-4 py-2 rounded text-white text-sm font-medium"
              style={{ backgroundColor: theme.colorPrimary, borderRadius: theme.borderRadius }}>
              Knop voorbeeld
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <h2 className="font-semibold text-stone-700 mb-3">Kleuren</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "colorPrimary" as keyof SiteTheme, label: "Primair" },
              { key: "colorSecondary" as keyof SiteTheme, label: "Secundair" },
              { key: "colorAccent" as keyof SiteTheme, label: "Accent" },
              { key: "colorBackground" as keyof SiteTheme, label: "Achtergrond" },
              { key: "colorSurface" as keyof SiteTheme, label: "Oppervlak" },
              { key: "colorText" as keyof SiteTheme, label: "Tekst" },
              { key: "colorTextMuted" as keyof SiteTheme, label: "Subtiele tekst" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={String(theme[key] ?? "#000000")}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border border-stone-200 p-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-stone-700">{label}</p>
                  <p className="text-xs text-stone-400">{String(theme[key])}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <h2 className="font-semibold text-stone-700 mb-3">Lettertypen</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Kop-font</label>
              <select
                value={theme.fontHeading ?? ""}
                onChange={(e) => set("fontHeading", e.target.value)}
                className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
              >
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Tekst-font</label>
              <select
                value={theme.fontBody ?? ""}
                onChange={(e) => set("fontBody", e.target.value)}
                className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm"
              >
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Border radius */}
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <h2 className="font-semibold text-stone-700 mb-3">Hoekafronding knoppen</h2>
          <div className="flex gap-2">
            {[{ value: "0", label: "Recht" }, { value: "0.25rem", label: "Klein" }, { value: "0.5rem", label: "Normaal" }, { value: "1rem", label: "Groot" }, { value: "9999px", label: "Rond" }].map((o) => (
              <button
                key={o.value}
                onClick={() => set("borderRadius", o.value)}
                className={`px-3 py-1.5 text-sm border ${theme.borderRadius === o.value ? "border-amber-500 bg-amber-50 text-amber-800" : "border-stone-200 text-stone-600 hover:bg-stone-50"} transition-colors`}
                style={{ borderRadius: o.value }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
