"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
} from "lucide-react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { Page } from "@/lib/db";
import { cn } from "@/lib/utils";

const FONTS = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: '"Playfair Display", serif', label: "Playfair" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: '"Times New Roman", serif', label: "Times" },
  { value: "Verdana, sans-serif", label: "Verdana" },
];

const SIZES = [
  { value: "12px", label: "12" },
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
  { value: "32px", label: "32" },
  { value: "40px", label: "40" },
];

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { currentSite } = useSiteStore();
  const [pages, setPages] = useState<Page[]>([]);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkPage, setLinkPage] = useState("");

  useEffect(() => {
    if (!currentSite) return;
    fetch(`/api/admin/pages?siteId=${currentSite.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPages(data);
      })
      .catch(() => {});
  }, [currentSite]);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "<p></p>";
    }
  }, [value]);

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function cmd(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    emit();
  }

  function applyFont(family: string) {
    cmd("fontName", family);
  }

  function applySize(size: string) {
    wrapSelection({ fontSize: size });
  }

  function applyWeight(weight: string) {
    wrapSelection({ fontWeight: weight });
  }

  function wrapSelection(styles: Record<string, string>) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    try {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      Object.assign(span.style, styles);
      range.surroundContents(span);
      emit();
    } catch {
      cmd("bold");
    }
  }

  function applyLink() {
    const href = linkPage || linkUrl;
    if (!href) return;
    cmd("createLink", href);
    setShowLink(false);
    setLinkUrl("https://");
    setLinkPage("");
  }

  return (
    <div className="border border-stone-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-stone-200 bg-stone-50">
        <ToolBtn title="Vet" onClick={() => cmd("bold")}><Bold size={13} /></ToolBtn>
        <ToolBtn title="Schuin" onClick={() => cmd("italic")}><Italic size={13} /></ToolBtn>
        <ToolBtn title="Onderstrepen" onClick={() => cmd("underline")}><Underline size={13} /></ToolBtn>
        <ToolBtn title="Doorhalen" onClick={() => cmd("strikeThrough")}><Strikethrough size={13} /></ToolBtn>
        <Sep />
        <select
          className="h-7 text-[11px] border border-stone-200 rounded px-1 bg-white max-w-[90px]"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) applyFont(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>Lettertype</option>
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select
          className="h-7 text-[11px] border border-stone-200 rounded px-1 bg-white w-14"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) applySize(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>Pt</option>
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          className="h-7 text-[11px] border border-stone-200 rounded px-1 bg-white w-[72px]"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) applyWeight(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>Dikte</option>
          <option value="300">Licht</option>
          <option value="400">Normaal</option>
          <option value="600">Halfvet</option>
          <option value="700">Vet</option>
          <option value="800">Extra vet</option>
        </select>
        <Sep />
        <ToolBtn title="Links" onClick={() => cmd("justifyLeft")}><AlignLeft size={13} /></ToolBtn>
        <ToolBtn title="Midden" onClick={() => cmd("justifyCenter")}><AlignCenter size={13} /></ToolBtn>
        <ToolBtn title="Rechts" onClick={() => cmd("justifyRight")}><AlignRight size={13} /></ToolBtn>
        <Sep />
        <ToolBtn title="Lijst" onClick={() => cmd("insertUnorderedList")}><List size={13} /></ToolBtn>
        <ToolBtn title="Nummering" onClick={() => cmd("insertOrderedList")}><ListOrdered size={13} /></ToolBtn>
        <input
          type="color"
          title="Tekstkleur"
          defaultValue="#1c1917"
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => cmd("foreColor", e.target.value)}
          className="w-7 h-7 p-0.5 border border-stone-200 rounded cursor-pointer bg-white"
        />
        <Sep />
        <ToolBtn title="Link" onClick={() => setShowLink((v) => !v)}><Link2 size={13} /></ToolBtn>
        <ToolBtn title="Link verwijderen" onClick={() => cmd("unlink")}><Unlink size={13} /></ToolBtn>
      </div>

      {showLink && (
        <div className="p-2 border-b border-stone-200 space-y-2 bg-amber-50">
          <p className="text-[11px] font-medium text-stone-600">Link van selectie</p>
          <select
            value={linkPage}
            onChange={(e) => {
              setLinkPage(e.target.value);
              if (e.target.value) setLinkUrl("");
            }}
            className="w-full text-xs border border-stone-300 rounded px-2 py-1"
          >
            <option value="">Pagina op deze site…</option>
            {currentSite && (
              <option value={`/${currentSite.slug}`}>Home</option>
            )}
            {pages
              .filter((p) => p.slug)
              .map((p) => (
                <option key={p.id} value={`/${currentSite?.slug}/${p.slug}`}>
                  {p.title}
                </option>
              ))}
            {currentSite && (
              <>
                <option value={`/${currentSite.slug}/blog`}>Blog</option>
                <option value={`/${currentSite.slug}/podcast`}>Podcast</option>
              </>
            )}
          </select>
          <input
            value={linkUrl}
            onChange={(e) => {
              setLinkUrl(e.target.value);
              setLinkPage("");
            }}
            placeholder="Of externe URL (https://…)"
            className="w-full text-xs border border-stone-300 rounded px-2 py-1"
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={applyLink}
              className="flex-1 text-xs bg-amber-600 text-white rounded py-1"
            >
              Link toepassen
            </button>
            <button
              type="button"
              onClick={() => setShowLink(false)}
              className="text-xs px-2 text-stone-500"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        className="min-h-[140px] px-3 py-2 text-sm focus:outline-none prose max-w-none"
      />
    </div>
  );
}

function ToolBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded text-stone-600 hover:bg-white hover:text-stone-900"
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-stone-200 mx-0.5 self-center" />;
}
