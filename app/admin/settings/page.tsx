"use client";
import { useEffect, useState } from "react";
import { useSiteStore } from "@/lib/stores/siteStore";
import { Save } from "lucide-react";

interface Settings {
  plausibleDomain?: string;
  cookieBannerEnabled?: boolean;
  footerText?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
}

export default function SettingsPage() {
  const { currentSite, loaded } = useSiteStore(); 
  const [settings, setSettings] = useState<Settings>({ cookieBannerEnabled: true });
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loaded || !currentSite) return;
    setName(currentSite.name);
    setDomain(currentSite.domain ?? "");
    setContactEmail(currentSite.contactEmail ?? "");
    fetch(`/api/admin/settings?siteId=${currentSite.id}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setSettings(d); });
  }, [loaded, currentSite]);

  async function save() {
    if (!loaded || !currentSite) return;
    setSaving(true);
    await Promise.all([
      fetch(`/api/admin/sites/${currentSite.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain: domain || null, contactEmail: contactEmail || null }),
      }),
      fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: currentSite.id, ...settings }),
      }),
    ]);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Instellingen</h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
          <Save size={16} />{saved ? "Opgeslagen ✓" : saving ? "Opslaan..." : "Opslaan"}
        </button>
      </div>

      <div className="space-y-4">
        <Section title="Site informatie">
          <Field label="Naam"><Input value={name} onChange={setName} /></Field>
          <Field label="Eigen domein"><Input value={domain} onChange={setDomain} placeholder="jouwdomein.nl" /></Field>
          <Field label="Contact e-mail"><Input value={contactEmail} onChange={setContactEmail} type="email" /></Field>
        </Section>

        <Section title="Analytics">
          <Field label="Plausible domein">
            <Input value={settings.plausibleDomain ?? ""} onChange={(v) => setSettings((s) => ({ ...s, plausibleDomain: v }))} placeholder="jouwdomein.nl" />
            <p className="text-xs text-stone-400 mt-0.5">Vul in om Plausible Analytics te activeren (privacy-vriendelijk)</p>
          </Field>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cookiebanner"
              checked={settings.cookieBannerEnabled ?? true}
              onChange={(e) => setSettings((s) => ({ ...s, cookieBannerEnabled: e.target.checked }))}
            />
            <label htmlFor="cookiebanner" className="text-sm text-stone-600">Cookie-banner tonen</label>
          </div>
        </Section>

        <Section title="Social media">
          <Field label="Facebook"><Input value={settings.socialFacebook ?? ""} onChange={(v) => setSettings((s) => ({ ...s, socialFacebook: v }))} placeholder="https://facebook.com/..." /></Field>
          <Field label="Instagram"><Input value={settings.socialInstagram ?? ""} onChange={(v) => setSettings((s) => ({ ...s, socialInstagram: v }))} placeholder="https://instagram.com/..." /></Field>
          <Field label="LinkedIn"><Input value={settings.socialLinkedin ?? ""} onChange={(v) => setSettings((s) => ({ ...s, socialLinkedin: v }))} placeholder="https://linkedin.com/..." /></Field>
        </Section>

        <Section title="Footer">
          <Field label="Footertekst"><Input value={settings.footerText ?? ""} onChange={(v) => setSettings((s) => ({ ...s, footerText: v }))} placeholder="Alle rechten voorbehouden" /></Field>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
      <h2 className="font-semibold text-stone-700 text-sm border-b border-stone-100 pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
  );
}
