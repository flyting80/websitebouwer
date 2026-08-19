"use client";

import type { Block, BlockType } from "@/lib/types/blocks";
import type {
  HeadingBlock, TextBlock, ImageBlock, ButtonBlock, DividerBlock,
  SpacerBlock, HeroBlock, GalleryBlock, ContactFormBlock, EmbedBlock,
  CardGridBlock, TestimonialBlock, FaqBlock, PodcastBlock, NavbarBlock, ColumnsBlock, SectionBlock,
} from "@/lib/types/blocks";
import { X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { MediaPicker } from "./MediaPicker";
import { setColumnCount } from "@/lib/block-tree";

interface Props {
  block: Block | null;
  onChange: (updated: Block) => void;
  onClose: () => void;
  seo?: { title: string; description: string; image: string };
  onSeoChange?: (seo: { title: string; description: string; image: string }) => void;
}

export function PropertiesPanel({ block, onChange, onClose, seo, onSeoChange }: Props) {
  if (!block) {
    return (
      <div className="w-80 shrink-0 bg-stone-50 border-l border-stone-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">SEO</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {seo && onSeoChange ? (
            <SeoFields seo={seo} onChange={onSeoChange} />
          ) : (
            <p className="text-stone-400 text-sm text-center mt-8">Selecteer een blok om te bewerken</p>
          )}
        </div>
      </div>
    );
  }

  function update(props: Partial<Block["props"]>) {
    onChange({ ...block!, props: { ...block!.props, ...props } } as Block);
  }

  function updateStyle(style: Partial<NonNullable<Block["style"]>>) {
    onChange({ ...block!, style: { ...block!.style, ...style } } as Block);
  }

  return (
    <div className="w-80 shrink-0 bg-stone-50 border-l border-stone-200 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider capitalize">
          {block.type}
        </p>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Block-specific props */}
        {block.type === "heading" && <HeadingProps block={block as HeadingBlock} update={update} />}
        {block.type === "text" && <TextProps block={block as TextBlock} update={update} />}
        {block.type === "image" && <ImageProps block={block as ImageBlock} update={update} />}
        {block.type === "button" && <ButtonProps block={block as ButtonBlock} update={update} />}
        {block.type === "divider" && <DividerProps block={block as DividerBlock} update={update} />}
        {block.type === "spacer" && <SpacerProps block={block as SpacerBlock} update={update} />}
        {block.type === "hero" && <HeroProps block={block as HeroBlock} update={update} />}
        {block.type === "columns" && <ColumnsProps block={block as ColumnsBlock} onChange={onChange} />}
        {block.type === "section" && <SectionProps block={block as SectionBlock} update={update} />}
        {block.type === "gallery" && <GalleryProps block={block as GalleryBlock} update={update} />}
        {block.type === "contact-form" && <ContactFormProps block={block as ContactFormBlock} update={update} />}
        {block.type === "embed" && <EmbedProps block={block as EmbedBlock} update={update} />}
        {block.type === "card-grid" && <CardGridProps block={block as CardGridBlock} update={update} />}
        {block.type === "testimonial" && <TestimonialProps block={block as TestimonialBlock} update={update} />}
        {block.type === "faq" && <FaqProps block={block as FaqBlock} update={update} />}
        {block.type === "podcast" && <PodcastProps block={block as PodcastBlock} update={update} />}
        {block.type === "navbar" && <NavbarProps block={block as NavbarBlock} update={update} />}

        {/* Universal style overrides */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Opmaak</p>
          <label className="block text-xs text-stone-500 mb-0.5">Achtergrondkleur</label>
          <input
            type="color"
            value={block.style?.backgroundColor ?? "#ffffff"}
            onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            className="h-8 w-full rounded cursor-pointer border border-stone-200"
          />
          <button
            onClick={() => updateStyle({ backgroundColor: undefined })}
            className="text-xs text-stone-400 hover:text-stone-600 mt-1"
          >
            Standaard herstellen
          </button>
        </div>

        {seo && onSeoChange && (
          <div className="pt-3 border-t border-stone-200">
            <SeoFields seo={seo} onChange={onSeoChange} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
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
      className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
    />
  );
}

function SeoFields({
  seo,
  onChange,
}: {
  seo: { title: string; description: string; image: string };
  onChange: (seo: { title: string; description: string; image: string }) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Zoekmachines & delen</p>
      <p className="text-[11px] text-stone-400">Deze tekst verschijnt in Google en als je de pagina deelt.</p>
      <Field label="SEO-titel">
        <Input value={seo.title} onChange={(title) => onChange({ ...seo, title })} placeholder="Titel in Google" />
      </Field>
      <Field label="Beschrijving">
        <Textarea value={seo.description} onChange={(description) => onChange({ ...seo, description })} rows={3} />
      </Field>
      <MediaPicker
        label="Deelafbeelding"
        url={seo.image}
        onSelect={(media) => onChange({ ...seo, image: media.url })}
        onClear={() => onChange({ ...seo, image: "" })}
      />
    </div>
  );
}

// ─── Block-specific prop panels ───────────────────────────────────────────────
function HeadingProps({ block, update }: { block: HeadingBlock; update: (p: Partial<HeadingBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Tekst"><Input value={block.props.text} onChange={(v) => update({ text: v })} /></Field>
      <Field label="Kopstijl">
        <Select
          value={String(block.props.level)}
          onChange={(v) => update({ level: Number(v) as 1 | 2 | 3 | 4 | 5 })}
          options={[
            { value: "1", label: "Kop 1 — extra groot" },
            { value: "2", label: "Kop 2 — groot" },
            { value: "3", label: "Kop 3 — middel" },
            { value: "4", label: "Kop 4 — klein" },
            { value: "5", label: "Kop 5 — extra klein" },
          ]}
        />
      </Field>
      <div className="rounded-lg border border-stone-200 bg-white p-3 space-y-1">
        <p className="text-xs text-stone-400 mb-2">Voorbeeld groottes</p>
        <p className="text-4xl font-bold leading-tight text-stone-800">Kop 1</p>
        <p className="text-3xl font-bold text-stone-800">Kop 2</p>
        <p className="text-2xl font-bold text-stone-800">Kop 3</p>
        <p className="text-xl font-bold text-stone-800">Kop 4</p>
        <p className="text-lg font-bold text-stone-800">Kop 5</p>
        <p className="text-base text-stone-600 pt-1">Standaard tekst</p>
      </div>
      <Field label="Uitlijning"><Select value={block.props.align} onChange={(v) => update({ align: v as "left"|"center"|"right" })} options={[{value:"left",label:"Links"},{value:"center",label:"Midden"},{value:"right",label:"Rechts"}]} /></Field>
    </>
  );
}

function TextProps({ block, update }: { block: TextBlock; update: (p: Partial<TextBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Tekst">
        <RichTextEditor value={block.props.html} onChange={(html) => update({ html })} />
        <p className="text-xs text-stone-400 mt-1">
          Selecteer tekst en kies vet, schuin, onderstrepen, lettergrootte of een link naar een pagina of URL.
        </p>
      </Field>
      <Field label="Uitlijning"><Select value={block.props.align} onChange={(v) => update({ align: v as "left"|"center"|"right" })} options={[{value:"left",label:"Links"},{value:"center",label:"Midden"},{value:"right",label:"Rechts"}]} /></Field>
    </>
  );
}

function ImageProps({ block, update }: { block: ImageBlock; update: (p: Partial<ImageBlock["props"]>) => void }) {
  return (
    <>
      <MediaPicker
        label="Afbeelding"
        url={block.props.url}
        onSelect={(media) => update({ url: media.url, alt: block.props.alt || media.alt })}
        onClear={() => update({ url: "" })}
      />
      <Field label="Of URL"><Input value={block.props.url} onChange={(v) => update({ url: v })} placeholder="https://..." /></Field>
      <Field label="Alt tekst"><Input value={block.props.alt} onChange={(v) => update({ alt: v })} /></Field>
      <Field label="Bijschrift"><Input value={block.props.caption ?? ""} onChange={(v) => update({ caption: v })} /></Field>
      <Field label="Link naar"><Input value={block.props.href ?? ""} onChange={(v) => update({ href: v })} /></Field>
      <Field label="Afbeelding vullen"><Select value={block.props.fit} onChange={(v) => update({ fit: v as "cover"|"contain"|"fill" })} options={[{value:"cover",label:"Bijsnijden"},{value:"contain",label:"Passend"},{value:"fill",label:"Uitrekken"}]} /></Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="rounded" checked={block.props.rounded} onChange={(e) => update({ rounded: e.target.checked })} />
        <label htmlFor="rounded" className="text-sm text-stone-600">Afgeronde hoeken</label>
      </div>
    </>
  );
}

function ButtonProps({ block, update }: { block: ButtonBlock; update: (p: Partial<ButtonBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Label"><Input value={block.props.label} onChange={(v) => update({ label: v })} /></Field>
      <Field label="Link"><Input value={block.props.href} onChange={(v) => update({ href: v })} placeholder="/over-ons of https://..." /></Field>
      <Field label="Stijl"><Select value={block.props.variant} onChange={(v) => update({ variant: v as ButtonBlock["props"]["variant"] })} options={[{value:"primary",label:"Primair"},{value:"secondary",label:"Secundair"},{value:"outline",label:"Omlijnd"},{value:"ghost",label:"Ghost"}]} /></Field>
      <Field label="Uitlijning"><Select value={block.props.align} onChange={(v) => update({ align: v as "left"|"center"|"right" })} options={[{value:"left",label:"Links"},{value:"center",label:"Midden"},{value:"right",label:"Rechts"}]} /></Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="newtab" checked={block.props.openInNewTab} onChange={(e) => update({ openInNewTab: e.target.checked })} />
        <label htmlFor="newtab" className="text-sm text-stone-600">Openen in nieuw tabblad</label>
      </div>
    </>
  );
}

function DividerProps({ block, update }: { block: DividerBlock; update: (p: Partial<DividerBlock["props"]>) => void }) {
  return (
    <Field label="Stijl"><Select value={block.props.style} onChange={(v) => update({ style: v as DividerBlock["props"]["style"] })} options={[{value:"line",label:"Lijn"},{value:"dots",label:"Stippen"},{value:"space",label:"Ruimte"}]} /></Field>
  );
}

function SpacerProps({ block, update }: { block: SpacerBlock; update: (p: Partial<SpacerBlock["props"]>) => void }) {
  return (
    <Field label="Hoogte (px)">
      <input type="range" min={8} max={200} step={4} value={block.props.height} onChange={(e) => update({ height: Number(e.target.value) })} className="w-full" />
      <p className="text-xs text-stone-400 text-right">{block.props.height}px</p>
    </Field>
  );
}

function ColumnsProps({ block, onChange }: { block: ColumnsBlock; onChange: (updated: Block) => void }) {
  return (
    <>
      <Field label="Aantal kolommen">
        <Select
          value={String(block.props.columns)}
          onChange={(v) => onChange(setColumnCount(block, Number(v) as 2 | 3 | 4))}
          options={[
            { value: "2", label: "2 kolommen" },
            { value: "3", label: "3 kolommen" },
            { value: "4", label: "4 kolommen" },
          ]}
        />
      </Field>
      <Field label="Ruimte ertussen">
        <Select
          value={block.props.gap}
          onChange={(v) => onChange({ ...block, props: { ...block.props, gap: v as ColumnsBlock["props"]["gap"] } })}
          options={[
            { value: "sm", label: "Krap" },
            { value: "md", label: "Normaal" },
            { value: "lg", label: "Ruim" },
          ]}
        />
      </Field>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="stackmobile"
          checked={block.props.stackOnMobile}
          onChange={(e) => onChange({ ...block, props: { ...block.props, stackOnMobile: e.target.checked } })}
        />
        <label htmlFor="stackmobile" className="text-sm text-stone-600">Op telefoon onder elkaar</label>
      </div>
      <p className="text-xs text-stone-400">
        Sleep een kop, tekst of afbeelding vanuit de lijst links naar Kolom 1 of Kolom 2. Klik daarna op die inhoud om hem te bewerken.
      </p>
    </>
  );
}

function SectionProps({ block, update }: { block: SectionBlock; update: (p: Partial<SectionBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Breedte">
        <Select
          value={block.props.maxWidth}
          onChange={(v) => update({ maxWidth: v as SectionBlock["props"]["maxWidth"] })}
          options={[
            { value: "sm", label: "Smal" },
            { value: "md", label: "Middel" },
            { value: "lg", label: "Breed" },
            { value: "xl", label: "Extra breed" },
            { value: "full", label: "Volledig" },
          ]}
        />
      </Field>
      <Field label="Zijmarge">
        <Select
          value={block.props.paddingX}
          onChange={(v) => update({ paddingX: v as SectionBlock["props"]["paddingX"] })}
          options={[
            { value: "none", label: "Geen" },
            { value: "sm", label: "Klein" },
            { value: "md", label: "Normaal" },
            { value: "lg", label: "Groot" },
          ]}
        />
      </Field>
      <p className="text-xs text-stone-400">Sleep blokken naar de + in deze sectie.</p>
    </>
  );
}

function HeroProps({ block, update }: { block: HeroBlock; update: (p: Partial<HeroBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Titel"><Input value={block.props.title} onChange={(v) => update({ title: v })} /></Field>
      <Field label="Ondertitel"><Input value={block.props.subtitle ?? ""} onChange={(v) => update({ subtitle: v })} /></Field>
      <MediaPicker
        label="Achtergrond"
        url={block.props.backgroundUrl}
        onSelect={(media) => update({ backgroundUrl: media.url })}
        onClear={() => update({ backgroundUrl: "" })}
      />
      <Field label="Of achtergrond-URL"><Input value={block.props.backgroundUrl ?? ""} onChange={(v) => update({ backgroundUrl: v })} placeholder="https://..." /></Field>
      <Field label={`Donkerheid overlay (${block.props.backgroundOverlay}%)`}>
        <input type="range" min={0} max={90} step={5} value={block.props.backgroundOverlay} onChange={(e) => update({ backgroundOverlay: Number(e.target.value) })} className="w-full" />
      </Field>
      <Field label="Knop label"><Input value={block.props.buttonLabel ?? ""} onChange={(v) => update({ buttonLabel: v })} /></Field>
      <Field label="Knop link"><Input value={block.props.buttonHref ?? ""} onChange={(v) => update({ buttonHref: v })} /></Field>
      <Field label="Uitlijning"><Select value={block.props.align} onChange={(v) => update({ align: v as "left"|"center"|"right" })} options={[{value:"left",label:"Links"},{value:"center",label:"Midden"},{value:"right",label:"Rechts"}]} /></Field>
      <Field label={`Minimale hoogte (${block.props.minHeight}px)`}>
        <input type="range" min={200} max={900} step={50} value={block.props.minHeight} onChange={(e) => update({ minHeight: Number(e.target.value) })} className="w-full" />
      </Field>
    </>
  );
}

function GalleryProps({ block, update }: { block: GalleryBlock; update: (p: Partial<GalleryBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Kolommen"><Select value={String(block.props.columns)} onChange={(v) => update({ columns: Number(v) as 2|3|4 })} options={[{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}]} /></Field>
      <Field label="Verhouding"><Select value={block.props.aspectRatio} onChange={(v) => update({ aspectRatio: v as GalleryBlock["props"]["aspectRatio"] })} options={[{value:"square",label:"Vierkant"},{value:"landscape",label:"Landschap"},{value:"portrait",label:"Portret"}]} /></Field>
      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600">Afbeeldingen</p>
        {block.props.images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="flex items-center gap-2">
            <img src={img.url} alt={img.alt} className="w-10 h-10 object-cover rounded" />
            <p className="flex-1 text-xs text-stone-500 truncate">{img.alt || img.url}</p>
            <button
              type="button"
              className="text-xs text-red-400 hover:text-red-600"
              onClick={() => update({ images: block.props.images.filter((_, j) => j !== i) })}
            >
              Weg
            </button>
          </div>
        ))}
        <MediaPicker
          label="Toevoegen"
          onSelect={(media) => update({ images: [...block.props.images, { url: media.url, alt: media.alt }] })}
        />
      </div>
    </>
  );
}

function ContactFormProps({ block, update }: { block: ContactFormBlock; update: (p: Partial<ContactFormBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Formulier titel"><Input value={block.props.title ?? ""} onChange={(v) => update({ title: v })} /></Field>
      <Field label="Knoptekst"><Input value={block.props.submitLabel} onChange={(v) => update({ submitLabel: v })} /></Field>
      <Field label="Succesbericht"><Textarea value={block.props.successMessage} onChange={(v) => update({ successMessage: v })} /></Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="subject" checked={block.props.includeSubject} onChange={(e) => update({ includeSubject: e.target.checked })} />
        <label htmlFor="subject" className="text-sm text-stone-600">Onderwerp-veld tonen</label>
      </div>
    </>
  );
}

function EmbedProps({ block, update }: { block: EmbedBlock; update: (p: Partial<EmbedBlock["props"]>) => void }) {
  return (
    <>
      <Field label="YouTube / Vimeo URL"><Input value={block.props.url} onChange={(v) => update({ url: v })} placeholder="https://youtube.com/..." /></Field>
      <Field label="Verhouding"><Select value={block.props.aspectRatio} onChange={(v) => update({ aspectRatio: v as EmbedBlock["props"]["aspectRatio"] })} options={[{value:"16/9",label:"16:9"},{value:"4/3",label:"4:3"},{value:"1/1",label:"1:1"}]} /></Field>
      <Field label="Bijschrift"><Input value={block.props.caption ?? ""} onChange={(v) => update({ caption: v })} /></Field>
    </>
  );
}

function CardGridProps({ block, update }: { block: CardGridBlock; update: (p: Partial<CardGridBlock["props"]>) => void }) {
  const cards = block.props.cards ?? [];

  function updateCard(i: number, patch: Partial<CardGridBlock["props"]["cards"][number]>) {
    const next = [...cards];
    next[i] = { ...next[i], ...patch };
    update({ cards: next });
  }

  function addCard() {
    update({ cards: [...cards, { title: "Nieuwe kaart", body: "" }] });
  }

  function removeCard(i: number) {
    update({ cards: cards.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-3">
      <Field label="Kolommen">
        <Select value={String(block.props.columns)} onChange={(v) => update({ columns: Number(v) as 2|3|4 })} options={[{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}]} />
      </Field>
      <div className="space-y-2">
        {cards.map((card, i) => (
          <div key={i} className="border border-stone-200 rounded-lg p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Kaart {i + 1}</span>
              <button onClick={() => removeCard(i)} className="text-xs text-red-400 hover:text-red-600">Verwijder</button>
            </div>
            <Input value={card.title} onChange={(v) => updateCard(i, { title: v })} placeholder="Titel" />
            <Textarea value={card.body} onChange={(v) => updateCard(i, { body: v })} placeholder="Beschrijving" />
            <Input value={card.imageUrl ?? ""} onChange={(v) => updateCard(i, { imageUrl: v || undefined })} placeholder="Afbeelding URL (optioneel)" />
            <Input value={card.href ?? ""} onChange={(v) => updateCard(i, { href: v || undefined })} placeholder="Link URL (optioneel)" />
          </div>
        ))}
      </div>
      <button
        onClick={addCard}
        className="w-full text-xs border border-dashed border-stone-300 rounded-lg py-1.5 text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors"
      >
        + Kaart toevoegen
      </button>
    </div>
  );
}

function TestimonialProps({ block, update }: { block: TestimonialBlock; update: (p: Partial<TestimonialBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Quote"><Textarea value={block.props.quote} onChange={(v) => update({ quote: v })} /></Field>
      <Field label="Naam"><Input value={block.props.author} onChange={(v) => update({ author: v })} /></Field>
      <Field label="Functie"><Input value={block.props.role ?? ""} onChange={(v) => update({ role: v })} /></Field>
      <Field label="Avatar URL"><Input value={block.props.avatarUrl ?? ""} onChange={(v) => update({ avatarUrl: v })} /></Field>
    </>
  );
}

function FaqProps({ block, update }: { block: FaqBlock; update: (p: Partial<FaqBlock["props"]>) => void }) {
  return (
    <div className="space-y-3">
      {block.props.items.map((item, i) => (
        <div key={i} className="border border-stone-200 rounded-lg p-2 space-y-1.5">
          <Input value={item.question} onChange={(v) => {
            const items = [...block.props.items];
            items[i] = { ...items[i], question: v };
            update({ items });
          }} placeholder="Vraag" />
          <Textarea value={item.answer} onChange={(v) => {
            const items = [...block.props.items];
            items[i] = { ...items[i], answer: v };
            update({ items });
          }} rows={2} />
          <button onClick={() => update({ items: block.props.items.filter((_, j) => j !== i) })} className="text-xs text-red-400 hover:text-red-600">
            Verwijderen
          </button>
        </div>
      ))}
      <button
        onClick={() => update({ items: [...block.props.items, { question: "", answer: "" }] })}
        className="w-full text-xs text-amber-700 hover:text-amber-900 border border-dashed border-amber-300 rounded-lg py-1.5"
      >
        + Vraag toevoegen
      </button>
    </div>
  );
}

function PodcastProps({ block, update }: { block: PodcastBlock; update: (p: Partial<PodcastBlock["props"]>) => void }) {
  return (
    <>
      <Field label="Weergave">
        <Select
          value={block.props.mode}
          onChange={(v) => update({ mode: v as PodcastBlock["props"]["mode"] })}
          options={[
            { value: "latest", label: "Laatste afleveringen" },
            { value: "single", label: "Eén aflevering" },
            { value: "link", label: "Link naar podcast-pagina" },
          ]}
        />
      </Field>
      <Field label="Titel"><Input value={block.props.title ?? ""} onChange={(v) => update({ title: v })} /></Field>
      {block.props.mode === "latest" && (
        <Field label="Aantal afleveringen">
          <Input type="number" value={String(block.props.limit)} onChange={(v) => update({ limit: Math.max(1, Number(v) || 1) })} />
        </Field>
      )}
      {block.props.mode === "single" && (
        <Field label="Aflevering slug">
          <Input value={block.props.episodeSlug ?? ""} onChange={(v) => update({ episodeSlug: v })} placeholder="aflevering-1" />
        </Field>
      )}
      {(block.props.mode === "latest" || block.props.mode === "link") && (
        <Field label="Linktekst"><Input value={block.props.linkLabel} onChange={(v) => update({ linkLabel: v })} /></Field>
      )}
      {block.props.mode !== "link" && (
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={block.props.showDescriptions} onChange={(e) => update({ showDescriptions: e.target.checked })} className="accent-amber-600" />
          Beschrijving tonen
        </label>
      )}
    </>
  );
}

function NavbarProps({ block, update }: { block: NavbarBlock; update: (p: Partial<NavbarBlock["props"]>) => void }) {
  return (
    <>
      <p className="text-xs text-stone-500">
        Sleep dit blok op de pagina, bijvoorbeeld onder de hero. Kies bij Menubalk de plaats &quot;Op de pagina&quot; om de vaste balk bovenaan uit te zetten.
      </p>
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input
          type="checkbox"
          checked={block.props.sticky}
          onChange={(e) => update({ sticky: e.target.checked })}
          className="accent-amber-600"
        />
        Vast bovenaan blijven bij scrollen
      </label>
      <a href="/admin/nav" className="block text-xs text-amber-700 hover:underline">
        Kleuren, lettertype en extra beeld/tekst instellen →
      </a>
    </>
  );
}
