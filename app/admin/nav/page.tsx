"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { NavItem, Page, SiteSettings } from "@/lib/db";
import { Plus, Trash2, ExternalLink, GripVertical, ChevronRight, ChevronLeft } from "lucide-react";
import { pageNavHref, normalizeNavHref } from "@/lib/site-href";
import { flattenNav, navParentId, navPlacement, navVisibility, type NavPlacement, type NavVisibility } from "@/lib/nav";
import {
  desktopZones,
  headerPosition,
  headerStyle,
  mobileZones,
  serializeHeaderStyle,
  serializeHeaderZones,
  type HeaderMobileStyle,
  type HeaderPosition,
} from "@/lib/header-layout";
import { HeaderLayoutEditor } from "@/components/admin/HeaderLayoutEditor";
import { HeaderStyleEditor } from "@/components/admin/HeaderStyleEditor";
import { MediaPicker } from "@/components/editor/MediaPicker";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function NavPage() {
  const { currentSite, loaded } = useSiteStore();
  const [items, setItems] = useState<NavItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const saveSettings = useCallback(async (patch: Partial<SiteSettings>) => {
    if (!currentSite) return;
    setSavingSettings(true);
    const next = { ...settings, ...patch };
    setSettings(next);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: currentSite.id, ...patch }),
    });
    setSavingSettings(false);
  }, [currentSite, settings]);

  useEffect(() => {
    if (!loaded || !currentSite) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/admin/nav?siteId=${currentSite.id}`).then((r) => r.json()),
      fetch(`/api/admin/pages?siteId=${currentSite.id}`).then((r) => r.json()),
      fetch(`/api/admin/settings?siteId=${currentSite.id}`).then((r) => r.json()),
    ])
      .then(([nav, pageList, siteSettings]) => {
        setItems(Array.isArray(nav) ? nav : []);
        setPages(Array.isArray(pageList) ? pageList : []);
        setSettings(siteSettings && typeof siteSettings === "object" ? siteSettings : {});
      })
      .finally(() => setLoading(false));
  }, [loaded, currentSite]);

  function findItemForHref(href: string) {
    const target = normalizeNavHref(href);
    return items.find((i) => normalizeNavHref(i.href) === target);
  }

  async function addItem(label: string, href: string, extra?: Partial<NavItem>) {
    if (!currentSite) return;
    const res = await fetch("/api/admin/nav", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: currentSite.id,
        label,
        href,
        sortOrder: items.length,
        placement: extra?.placement ?? "header",
        parentId: extra?.parentId ?? null,
      }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((i) => [...i, item]);
    }
  }

  async function update(id: string, data: Partial<NavItem>) {
    await fetch(`/api/admin/nav/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setItems((is) => is.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }

  async function remove(id: string) {
    const children = items.filter((i) => navParentId(i) === id);
    for (const child of children) {
      await fetch(`/api/admin/nav/${child.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: null }),
      });
    }
    await fetch(`/api/admin/nav/${id}`, { method: "DELETE" });
    setItems((is) =>
      is.filter((i) => i.id !== id).map((i) => (navParentId(i) === id ? { ...i, parentId: null } : i))
    );
  }

  async function togglePage(page: Page, checked: boolean) {
    const href = pageNavHref(page);
    const existing = findItemForHref(href);
    await fetch(`/api/admin/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showInNav: checked }),
    });
    setPages((ps) => ps.map((p) => (p.id === page.id ? { ...p, showInNav: checked } : p)));
    if (checked && !existing) await addItem(page.title, href);
    else if (!checked && existing) await remove(existing.id);
  }

  async function toggleBlog(checked: boolean) {
    const existing = findItemForHref("/blog");
    if (checked && !existing) await addItem("Blog", "/blog");
    else if (!checked && existing) await remove(existing.id);
  }

  async function togglePodcast(checked: boolean) {
    const existing = findItemForHref("/podcast");
    if (checked && !existing) await addItem("Podcast", "/podcast");
    else if (!checked && existing) await remove(existing.id);
  }

  async function persistOrder(next: NavItem[]) {
    setItems(next);
    await fetch("/api/admin/nav/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const tops = items.filter((i) => !navParentId(i)).sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIdx = tops.findIndex((i) => i.id === active.id);
    const newIdx = tops.findIndex((i) => i.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const moved = arrayMove(tops, oldIdx, newIdx);
    const rest = items.filter((i) => navParentId(i));
    const merged: NavItem[] = [];
    moved.forEach((top, i) => {
      merged.push({ ...top, sortOrder: merged.length });
      rest
        .filter((c) => navParentId(c) === top.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach((c) => merged.push({ ...c, sortOrder: merged.length }));
    });
    void persistOrder(merged);
  }

  async function indent(item: NavItem) {
    const tops = items.filter((i) => !navParentId(i)).sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = tops.findIndex((t) => t.id === item.id);
    if (idx <= 0) return;
    const parent = tops[idx - 1];
    const kids = items.filter((i) => navParentId(i) === item.id);
    await update(item.id, { parentId: parent.id });
    for (const kid of kids) {
      await update(kid.id, { parentId: parent.id });
    }
  }

  async function outdent(item: NavItem) {
    await update(item.id, { parentId: null });
  }

  function setPlacement(item: NavItem, header: boolean, footer: boolean) {
    const placement: NavPlacement = header && footer ? "both" : footer ? "footer" : "header";
    void update(item.id, { placement } as Partial<NavItem>);
  }

  function setVisibility(item: NavItem, desktop: boolean, mobile: boolean) {
    let visibility: NavVisibility = "both";
    if (desktop && mobile) visibility = "both";
    else if (desktop) visibility = "desktop";
    else if (mobile) visibility = "mobile";
    else visibility = "both";
    void update(item.id, { visibility } as Partial<NavItem>);
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  const blogInMenu = Boolean(findItemForHref("/blog"));
  const podcastInMenu = Boolean(findItemForHref("/podcast"));
  const ordered = flattenNav(items);
  const headerOn = settings.headerEnabled !== false;
  const dZones = desktopZones(settings as SiteSettings);
  const mZones = mobileZones(settings as SiteSettings);
  const position = headerPosition(settings as SiteSettings);
  const barStyle = headerStyle(settings as SiteSettings);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Menubalk</h1>
          <p className="text-stone-500 text-sm mt-1">
            Schakel de menubalk in/uit, sleep logo en navigatie, en stel desktop en mobiel apart in.
          </p>
        </div>
        <a
          href={`/${currentSite.slug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 shrink-0"
        >
          <ExternalLink size={14} /> Bekijk live
        </a>
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">Laden...</p>
      ) : (
        <>
          <section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-stone-700">Menubalk tonen</h2>
                <p className="text-xs text-stone-400">Zet de header uit voor landingspagina&apos;s zonder navigatie.</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={headerOn}
                  onChange={(e) => saveSettings({ headerEnabled: e.target.checked })}
                  className="accent-amber-600"
                />
                {headerOn ? "Aan" : "Uit"}
              </label>
            </div>

            {headerOn && (
              <>
                <div>
                  <p className="text-sm font-semibold text-stone-700 mb-2">Plaats op de pagina</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "top", label: "Bovenaan", hint: "Vaste menubalk boven de pagina" },
                      { value: "overlay", label: "Over de hero", hint: "Liggend over de eerste hero" },
                      { value: "below-hero", label: "Onder de hero", hint: "Eerst de banner, dan het menu" },
                      { value: "in-page", label: "Op de pagina (sleepbaar)", hint: "Sleep het Menubalk-blok in de editor" },
                    ] as const).map(({ value, label, hint }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => saveSettings({ headerPosition: value as HeaderPosition })}
                        className={`text-left px-3 py-2 rounded-lg border ${
                          position === value
                            ? "border-amber-500 bg-amber-50"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <p className={`text-xs font-medium ${position === value ? "text-amber-900" : "text-stone-700"}`}>{label}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{hint}</p>
                      </button>
                    ))}
                  </div>
                  {position === "in-page" && (
                    <p className="text-[11px] text-amber-800 mt-2">
                      Open een pagina in de editor en sleep het blok <strong>Menubalk</strong> onder de hero (of waar je wilt).
                    </p>
                  )}
                </div>

                {position !== "in-page" && (
                  <label className="flex items-center gap-2 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      checked={settings.headerSticky !== false}
                      onChange={(e) => saveSettings({ headerSticky: e.target.checked })}
                      className="accent-amber-600"
                    />
                    Menubalk vast bovenaan (sticky)
                  </label>
                )}

                <div className="pt-2 border-t border-stone-100 space-y-3">
                  <p className="text-sm font-semibold text-stone-700">Extra inhoud</p>
                  <label className="text-xs text-stone-600 block">
                    Tekst naast het menu (tagline)
                    <input
                      value={settings.headerTagline ?? ""}
                      onChange={(e) => setSettings((s) => ({ ...s, headerTagline: e.target.value }))}
                      onBlur={(e) => saveSettings({ headerTagline: e.target.value })}
                      placeholder="Bijv. Schatten zoeken met kinderen"
                      className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                    />
                  </label>
                  <MediaPicker
                    label="Klein extra plaatje"
                    url={settings.headerExtraImageUrl ?? ""}
                    onSelect={(m) => saveSettings({ headerExtraImageUrl: m.url })}
                    onClear={() => saveSettings({ headerExtraImageUrl: "" })}
                  />
                  <p className="text-[11px] text-stone-400">Sleep &quot;Tekst&quot; en &quot;Extra plaatje&quot; hieronder naar links, midden of rechts.</p>
                </div>

                <HeaderLayoutEditor
                  label="Desktop layout"
                  idPrefix="desk"
                  zones={dZones}
                  onChange={(zones) => saveSettings({ headerDesktopLayout: serializeHeaderZones(zones) })}
                />

                <div className="pt-2 border-t border-stone-100">
                  <p className="text-sm font-semibold text-stone-700 mb-2">Mobiele weergave</p>
                  <div className="flex gap-2 mb-3">
                    {([
                      { value: "drawer", label: "Hamburgermenu" },
                      { value: "bottom-bar", label: "Onderbalk (app-stijl)" },
                    ] as const).map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => saveSettings({ headerMobileStyle: value as HeaderMobileStyle })}
                        className={`flex-1 text-xs py-2 rounded-lg border ${
                          (settings.headerMobileStyle ?? "drawer") === value
                            ? "border-amber-500 bg-amber-50 text-amber-900 font-medium"
                            : "border-stone-200 text-stone-600 hover:border-stone-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <HeaderLayoutEditor
                    label="Mobiel — bovenbalk"
                    idPrefix="mob"
                    zones={mZones}
                    onChange={(zones) => saveSettings({ headerMobileLayout: serializeHeaderZones(zones) })}
                  />
                  {(settings.headerMobileStyle ?? "drawer") === "bottom-bar" && (
                    <p className="text-[11px] text-stone-400 mt-2">
                      Bij onderbalk verschijnt navigatie onderaan het scherm; max. 5 items. Logo blijft bovenaan.
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <HeaderStyleEditor
                    style={barStyle}
                    onChange={(next) => saveSettings({ headerStyle: serializeHeaderStyle(next) })}
                  />
                </div>

                {savingSettings && <p className="text-[11px] text-stone-400">Layout opslaan...</p>}
              </>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-700 mb-2">Pagina&apos;s in het menu</h2>
            <div className="space-y-2">
              {pages.map((page) => {
                const href = pageNavHref(page);
                const checked = Boolean(findItemForHref(href));
                return (
                  <label
                    key={page.id}
                    className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-amber-300"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => togglePage(page, e.target.checked)}
                      className="accent-amber-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800">{page.title}</p>
                      <p className="text-xs text-stone-400">{href === "/" ? "/" : href}</p>
                    </div>
                  </label>
                );
              })}
              <label className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-amber-300">
                <input
                  type="checkbox"
                  checked={blogInMenu}
                  onChange={(e) => toggleBlog(e.target.checked)}
                  className="accent-amber-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-stone-800">Blog</p>
                  <p className="text-xs text-stone-400">/blog</p>
                </div>
              </label>
              <label className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-amber-300">
                <input
                  type="checkbox"
                  checked={podcastInMenu}
                  onChange={(e) => togglePodcast(e.target.checked)}
                  className="accent-amber-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-stone-800">Podcast</p>
                  <p className="text-xs text-stone-400">/podcast</p>
                </div>
              </label>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-stone-700">Volgorde, submenu en plaats</h2>
              <button
                onClick={() => addItem("Nieuw item", "/", { placement: "header" } as Partial<NavItem>)}
                className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900"
              >
                <Plus size={14} /> Extra link
              </button>
            </div>
            <p className="text-xs text-stone-400 mb-2">
              Sleep aan het handvat om te herschikken. Pijltje naar rechts maakt een submenu onder het item erboven.
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={ordered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {ordered.map((item) => (
                    <NavRow
                      key={item.id}
                      item={item}
                      isChild={Boolean(navParentId(item))}
                      onUpdate={update}
                      onRemove={remove}
                      onIndent={() => indent(item)}
                      onOutdent={() => outdent(item)}
                      onPlacement={setPlacement}
                      onVisibility={setVisibility}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-6 text-stone-400 bg-white rounded-xl border border-dashed border-stone-200 text-sm">
                      Nog geen menu-items. Vink hierboven pagina&apos;s aan.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </section>

          <p className="text-xs text-stone-400">
            Juridische pagina&apos;s (privacy, cookies) horen meestal alleen in de footer.{" "}
            <Link href="/admin/pages" className="text-amber-700 underline">
              Pagina&apos;s beheren
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

function NavRow({
  item,
  isChild,
  onUpdate,
  onRemove,
  onIndent,
  onOutdent,
  onPlacement,
  onVisibility,
}: {
  item: NavItem;
  isChild: boolean;
  onUpdate: (id: string, data: Partial<NavItem>) => void;
  onRemove: (id: string) => void;
  onIndent: () => void;
  onOutdent: () => void;
  onPlacement: (item: NavItem, header: boolean, footer: boolean) => void;
  onVisibility: (item: NavItem, desktop: boolean, mobile: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isChild,
  });
  const placement = navPlacement(item);
  const headerOn = placement === "header" || placement === "both";
  const footerOn = placement === "footer" || placement === "both";
  const visibility = navVisibility(item);
  const desktopOn = visibility === "both" || visibility === "desktop";
  const mobileOn = visibility === "both" || visibility === "mobile";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`bg-white border border-stone-200 rounded-xl px-3 py-3 flex flex-wrap items-center gap-2 ${isChild ? "ml-8" : ""}`}
    >
      <button
        type="button"
        className={`p-1 text-stone-300 ${isChild ? "invisible" : "cursor-grab active:cursor-grabbing hover:text-stone-600"}`}
        {...attributes}
        {...listeners}
        title="Slepen"
      >
        <GripVertical size={16} />
      </button>
      {isChild ? (
        <button type="button" onClick={onOutdent} className="p-1 text-stone-400 hover:text-stone-700" title="Uit submenu">
          <ChevronLeft size={14} />
        </button>
      ) : (
        <button type="button" onClick={onIndent} className="p-1 text-stone-400 hover:text-stone-700" title="Submenu maken">
          <ChevronRight size={14} />
        </button>
      )}
      <input
        value={item.label}
        onChange={(e) => onUpdate(item.id, { label: e.target.value })}
        onBlur={(e) => onUpdate(item.id, { label: e.target.value })}
        className="flex-1 min-w-[100px] text-sm font-medium text-stone-700 focus:outline-none border-b border-transparent focus:border-amber-400 bg-transparent"
      />
      <input
        value={item.href}
        onChange={(e) => onUpdate(item.id, { href: e.target.value })}
        onBlur={(e) => onUpdate(item.id, { href: e.target.value })}
        className="w-36 text-sm text-stone-400 focus:outline-none border-b border-transparent focus:border-amber-400 bg-transparent"
        placeholder="/pagina of https://..."
      />
      <label className="flex items-center gap-1 text-[11px] text-stone-500">
        <input type="checkbox" checked={headerOn} onChange={(e) => onPlacement(item, e.target.checked, footerOn)} />
        Header
      </label>
      <label className="flex items-center gap-1 text-[11px] text-stone-500">
        <input type="checkbox" checked={footerOn} onChange={(e) => onPlacement(item, headerOn, e.target.checked)} />
        Footer
      </label>
      {headerOn && (
        <>
          <label className="flex items-center gap-1 text-[11px] text-stone-500" title="Desktop menubalk">
            <input type="checkbox" checked={desktopOn} onChange={(e) => onVisibility(item, e.target.checked, mobileOn)} />
            Desktop
          </label>
          <label className="flex items-center gap-1 text-[11px] text-stone-500" title="Mobiel menu">
            <input type="checkbox" checked={mobileOn} onChange={(e) => onVisibility(item, desktopOn, e.target.checked)} />
            Mobiel
          </label>
        </>
      )}
      <button onClick={() => onRemove(item.id)} className="text-stone-300 hover:text-red-500 p-1 rounded">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
