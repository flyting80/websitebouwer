"use client";

import * as React from "react";
import type { Block } from "@/lib/types/blocks";
import type {
  HeadingBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  HeroBlock,
  SectionBlock,
  ColumnsBlock,
  GalleryBlock,
  ContactFormBlock,
  EmbedBlock,
  CardGridBlock,
  TestimonialBlock,
  FaqBlock,
  PodcastBlock,
  NavbarBlock,
} from "@/lib/types/blocks";
import { PodcastBlockRender } from "./PodcastBlockRender";
import { NavbarBlockRender } from "./NavbarBlockRender";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import {
  previewGridCols,
  previewHeadingSize,
  previewResponsive,
  usePreviewMode,
} from "@/lib/preview-mode";
import Image from "next/image";

interface Props {
  block: Block;
  theme: Record<string, string>;
  isEditing?: boolean;
  siteId?: string;
  siteSlug?: string;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
}

export function BlockRenderer({ block, theme, isEditing, siteId, siteSlug, selectedId, onSelectBlock }: Props) {
  const nested = { theme, isEditing, siteId, siteSlug, selectedId, onSelectBlock };
  let inner: React.ReactNode;
  switch (block.type) {
    case "heading":
      inner = <HeadingRender block={block as HeadingBlock} theme={theme} />;
      break;
    case "text":
      inner = <TextRender block={block as TextBlock} theme={theme} />;
      break;
    case "image":
      inner = <ImageRender block={block as ImageBlock} theme={theme} />;
      break;
    case "button":
      inner = <ButtonRender block={block as ButtonBlock} theme={theme} isEditing={isEditing} />;
      break;
    case "divider":
      inner = <DividerRender block={block as DividerBlock} />;
      break;
    case "spacer":
      inner = <SpacerRender block={block as SpacerBlock} />;
      break;
    case "hero":
      inner = <HeroRender block={block as HeroBlock} theme={theme} isEditing={isEditing} />;
      break;
    case "section":
      inner = <SectionRender block={block as SectionBlock} {...nested} />;
      break;
    case "columns":
      inner = <ColumnsRender block={block as ColumnsBlock} {...nested} />;
      break;
    case "gallery":
      inner = <GalleryRender block={block as GalleryBlock} />;
      break;
    case "contact-form":
      inner = <ContactFormRender block={block as ContactFormBlock} theme={theme} isEditing={isEditing} siteId={siteId} />;
      break;
    case "embed":
      inner = <EmbedRender block={block as EmbedBlock} />;
      break;
    case "card-grid":
      inner = <CardGridRender block={block as CardGridBlock} theme={theme} />;
      break;
    case "testimonial":
      inner = <TestimonialRender block={block as TestimonialBlock} theme={theme} />;
      break;
    case "faq":
      inner = <FaqRender block={block as FaqBlock} theme={theme} />;
      break;
    case "podcast":
      inner = <PodcastBlockRender block={block as PodcastBlock} theme={theme} siteSlug={siteSlug} isEditing={isEditing} />;
      break;
    case "navbar":
      inner = <NavbarBlockRender block={block as NavbarBlock} theme={theme} isEditing={isEditing} />;
      break;
    default:
      inner = <div className="p-4 bg-stone-100 text-stone-400 text-sm">Onbekend blok: {(block as Block).type}</div>;
  }

  const isContainer = block.type === "section" || block.type === "columns";
  if (!isEditing || !onSelectBlock || isContainer) return inner;

  return (
    <div
      className={cn("relative", selectedId === block.id && "outline outline-2 outline-amber-400 outline-offset-2 rounded")}
      onClick={(e) => {
        e.stopPropagation();
        onSelectBlock(block.id);
      }}
    >
      {inner}
    </div>
  );
}

// ─── Heading ────────────────────────────────────────────────────────────────
function HeadingRender({ block, theme }: { block: HeadingBlock; theme: Record<string, string> }) {
  const previewMode = usePreviewMode();
  const { text, level, align } = block.props;
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5";
  const aligns: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return (
    <div className={cn("px-6 py-3", aligns[align] ?? "text-left")}>
      <Tag
        className={cn("font-bold", previewHeadingSize(previewMode, level))}
        style={{ color: theme.colorText, fontFamily: theme.fontHeading }}
      >
        {text}
      </Tag>
    </div>
  );
}

// ─── Text ────────────────────────────────────────────────────────────────────
function TextRender({ block, theme }: { block: TextBlock; theme: Record<string, string> }) {
  return (
    <div
      className={cn(
        "px-6 py-3 prose max-w-none",
        block.props.align === "center" ? "text-center" : block.props.align === "right" ? "text-right" : "text-left"
      )}
      style={{ color: theme.colorText, fontFamily: theme.fontBody }}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.props.html) }}
    />
  );
}

// ─── Image ───────────────────────────────────────────────────────────────────
function ImageRender({ block }: { block: ImageBlock; theme: Record<string, string> }) {
  const { url, alt, rounded, caption, fit } = block.props;
  if (!url) {
    return (
      <div className="mx-6 my-3 h-48 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-sm border border-dashed border-stone-300">
        Afbeelding
      </div>
    );
  }
  return (
    <figure className="px-6 py-3">
      <div className={cn("overflow-hidden", rounded ? "rounded-xl" : "")}>
        <img src={url} alt={alt} className={cn("w-full", fit === "cover" ? "object-cover" : "object-contain")} />
      </div>
      {caption && <figcaption className="text-center text-stone-400 text-sm mt-2">{caption}</figcaption>}
    </figure>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
function ButtonRender({ block, theme, isEditing }: { block: ButtonBlock; theme: Record<string, string>; isEditing?: boolean }) {
  const { label, href, variant, align, openInNewTab } = block.props;
  const variants: Record<string, string> = {
    primary: "text-white",
    secondary: "border-2",
    outline: "border",
    ghost: "hover:bg-opacity-10",
  };
  const btn = (
    <span
      className={cn(
        "inline-block px-6 py-3 rounded-lg font-medium transition-all",
        variants[variant]
      )}
      style={
        variant === "primary"
          ? { backgroundColor: theme.colorPrimary }
          : { borderColor: theme.colorPrimary, color: theme.colorPrimary }
      }
    >
      {label}
    </span>
  );
  return (
    <div className={cn("px-6 py-3", `text-${align}`)}>
      {isEditing ? btn : (
        <a href={href} target={openInNewTab ? "_blank" : undefined} rel="noopener noreferrer">
          {btn}
        </a>
      )}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function DividerRender({ block }: { block: DividerBlock }) {
  if (block.props.style === "space") return <div className="py-8" />;
  if (block.props.style === "dots") return (
    <div className="flex justify-center py-4 gap-2">
      {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-stone-300" />)}
    </div>
  );
  return <hr className="mx-8 my-4 border-stone-200" />;
}

// ─── Spacer ──────────────────────────────────────────────────────────────────
function SpacerRender({ block }: { block: SpacerBlock }) {
  return <div style={{ height: block.props.height }} />;
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function HeroRender({ block, theme, isEditing }: { block: HeroBlock; theme: Record<string, string>; isEditing?: boolean }) {
  const previewMode = usePreviewMode();
  const { title, subtitle, backgroundUrl, backgroundOverlay, align, minHeight, buttonLabel, buttonHref } = block.props;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full",
        previewResponsive(
          previewMode,
          "min-h-[var(--hero-min-h)]",
          "min-h-0 aspect-[16/9] max-h-[90vh]",
        ),
      )}
      style={{
        ["--hero-min-h" as string]: `${minHeight}px`,
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: backgroundUrl ? undefined : theme.colorPrimary,
      }}
    >
      {backgroundUrl && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${backgroundOverlay / 100})` }}
        />
      )}
      <div className={cn("relative z-10 px-8 py-16 max-w-3xl w-full", `text-${align}`)}>
        <h1
          className={cn(
            "font-bold mb-4 text-white drop-shadow",
            previewResponsive(previewMode, "text-4xl", "text-6xl"),
          )}
          style={{ fontFamily: theme.fontHeading }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-xl text-white/90 mb-8 drop-shadow">{subtitle}</p>}
        {buttonLabel && (
          <div>
            {isEditing ? (
              <span className="inline-block px-6 py-3 rounded-lg font-medium text-white border-2 border-white/80 backdrop-blur-sm">
                {buttonLabel}
              </span>
            ) : (
              <a
                href={buttonHref ?? "#"}
                className="inline-block px-6 py-3 rounded-lg font-medium text-white border-2 border-white/80 hover:bg-white hover:text-amber-800 transition-colors backdrop-blur-sm"
              >
                {buttonLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function SectionRender({
  block,
  theme,
  isEditing,
  siteId,
  siteSlug,
  selectedId,
  onSelectBlock,
}: {
  block: SectionBlock;
  theme: Record<string, string>;
  isEditing?: boolean;
  siteId?: string;
  siteSlug?: string;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
}) {
  const maxWidths = { sm: "max-w-sm", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl", full: "max-w-full" };
  const pads = { none: "", sm: "px-4", md: "px-6", lg: "px-8" };
  return (
    <div
      className={cn("mx-auto py-4", maxWidths[block.props.maxWidth], pads[block.props.paddingX])}
      style={block.style ? { backgroundColor: block.style.backgroundColor } : undefined}
    >
      {block.children?.map((child) => (
        <BlockRenderer
          key={child.id}
          block={child}
          theme={theme}
          isEditing={isEditing}
          siteId={siteId}
          siteSlug={siteSlug}
          selectedId={selectedId}
          onSelectBlock={onSelectBlock}
        />
      ))}
      {(!block.children || block.children.length === 0) && isEditing && (
        <div className="h-16 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-300 text-sm">
          Lege sectie
        </div>
      )}
    </div>
  );
}

function ColumnsRender({
  block,
  theme,
  isEditing,
  siteId,
  siteSlug,
  selectedId,
  onSelectBlock,
}: {
  block: ColumnsBlock;
  theme: Record<string, string>;
  isEditing?: boolean;
  siteId?: string;
  siteSlug?: string;
  selectedId?: string | null;
  onSelectBlock?: (id: string) => void;
}) {
  const previewMode = usePreviewMode();
  const gaps = { sm: "gap-4", md: "gap-6", lg: "gap-8" };
  return (
    <div
      className={cn(
        "grid px-6 py-4",
        gaps[block.props.gap],
        previewGridCols(previewMode, block.props.columns, block.props.stackOnMobile),
      )}
    >
      {(block.children ?? []).map((col) => (
        <div key={col.id} className="min-h-[40px]">
          <BlockRenderer
            block={col}
            theme={theme}
            isEditing={isEditing}
            siteId={siteId}
            siteSlug={siteSlug}
            selectedId={selectedId}
            onSelectBlock={onSelectBlock}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
function GalleryRender({ block }: { block: GalleryBlock }) {
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
  const aspects = { square: "aspect-square", landscape: "aspect-video", portrait: "aspect-[3/4]" };
  if (!(block.props.images ?? []).length) {
    return (
      <div className="mx-6 my-3 h-32 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-sm border border-dashed border-stone-300">
        Voeg afbeeldingen toe in de eigenschappen
      </div>
    );
  }
  return (
    <div className={cn("grid px-6 py-3", cols[block.props.columns], `gap-${block.props.gap === "sm" ? "2" : block.props.gap === "md" ? "3" : "4"}`)}>
      {(block.props.images ?? []).map((img, i) => (
        <div key={i} className={cn("overflow-hidden rounded-lg", aspects[block.props.aspectRatio])}>
          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────
function ContactFormRender({ block, theme, isEditing, siteId }: { block: ContactFormBlock; theme: Record<string, string>; isEditing?: boolean; siteId?: string }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditing) return;
    if (!siteId) {
      setFeedback("Site-id ontbreekt.");
      return;
    }

    setSending(true);
    setFeedback(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId,
        name,
        email,
        subject: block.props.includeSubject ? subject : undefined,
        message,
      }),
    });

    if (res.ok) {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setFeedback("Bedankt! Je bericht is verzonden.");
    } else {
      setFeedback("Verzenden mislukt. Probeer opnieuw.");
    }
    setSending(false);
  }

  return (
    <div id="contact" className="px-6 py-6 max-w-xl mx-auto">
      {block.props.title && (
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colorText, fontFamily: theme.fontHeading }}>
          {block.props.title}
        </h2>
      )}
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          disabled={isEditing || sending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naam"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
        />
        <input
          disabled={isEditing || sending}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mailadres"
          type="email"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
        />
        {block.props.includeSubject && (
          <input
            disabled={isEditing || sending}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Onderwerp"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
          />
        )}
        <textarea
          disabled={isEditing || sending}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Bericht"
          rows={4}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
        />
        <button
          type="submit"
          disabled={isEditing || sending || !name || !email || !message}
          className="px-6 py-2.5 rounded-lg text-white font-medium"
          style={{ backgroundColor: theme.colorPrimary }}
        >
          {sending ? "Versturen..." : block.props.submitLabel}
        </button>
        {feedback && <p className="text-sm text-stone-600">{feedback}</p>}
      </form>
    </div>
  );
}

// ─── Embed ────────────────────────────────────────────────────────────────────
function EmbedRender({ block }: { block: EmbedBlock }) {
  const { url, aspectRatio, caption } = block.props;
  let embedUrl = url;
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    embedUrl = `https://www.youtube.com/embed/${id}`;
  } else if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  } else if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0];
    embedUrl = `https://player.vimeo.com/video/${id}`;
  }

  const ratioClass = aspectRatio === "16/9" ? "aspect-video" : aspectRatio === "4/3" ? "aspect-[4/3]" : "aspect-square";

  if (!url) {
    return (
      <div className="mx-6 my-3 h-32 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-sm border border-dashed border-stone-300">
        Voeg een YouTube- of Vimeo-URL toe
      </div>
    );
  }

  return (
    <figure className="px-6 py-3">
      <div className={cn("rounded-xl overflow-hidden", ratioClass)}>
        <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
      </div>
      {caption && <figcaption className="text-center text-stone-400 text-sm mt-2">{caption}</figcaption>}
    </figure>
  );
}

// ─── Card grid ────────────────────────────────────────────────────────────────
function CardGridRender({ block, theme }: { block: CardGridBlock; theme: Record<string, string> }) {
  const previewMode = usePreviewMode();
  return (
    <div
      className={cn(
        "grid gap-5 px-6 py-4",
        previewGridCols(previewMode, block.props.columns),
      )}
    >
      {(block.props.cards ?? []).map((card, i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          {card.imageUrl && (
            <img src={card.imageUrl} alt={card.title} className="w-full h-40 object-cover" />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1" style={{ color: theme.colorText, fontFamily: theme.fontHeading }}>{card.title}</h3>
            <p className="text-stone-500 text-sm">{card.body}</p>
            {card.href && (
              <a href={card.href} className="text-sm font-medium mt-2 inline-block" style={{ color: theme.colorPrimary }}>
                Meer lezen →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
function TestimonialRender({ block, theme }: { block: TestimonialBlock; theme: Record<string, string> }) {
  return (
    <div className="px-8 py-8 max-w-2xl mx-auto text-center">
      <blockquote className="text-xl italic text-stone-700 mb-4">"{block.props.quote}"</blockquote>
      <div className="flex items-center justify-center gap-3">
        {block.props.avatarUrl && (
          <img src={block.props.avatarUrl} alt={block.props.author} className="w-10 h-10 rounded-full object-cover" />
        )}
        <div>
          <p className="font-semibold" style={{ color: theme.colorText }}>{block.props.author}</p>
          {block.props.role && <p className="text-stone-400 text-sm">{block.props.role}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqRender({ block, theme }: { block: FaqBlock; theme: Record<string, string> }) {
  return (
    <div className="px-6 py-4 max-w-2xl mx-auto space-y-3">
      {(block.props.items ?? []).map((item, i) => (
        <details key={i} className="border border-stone-200 rounded-xl overflow-hidden group">
          <summary className="px-4 py-3 font-medium cursor-pointer list-none flex justify-between items-center hover:bg-stone-50"
            style={{ color: theme.colorText }}>
            {item.question}
            <span className="text-stone-400 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-4 pb-3 text-stone-600 text-sm">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
