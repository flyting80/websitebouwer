// ─── Block type definitions ────────────────────────────────────────────────
// Every block has an id, type, and props. Props are type-specific.

export type BlockType =
  | "section"
  | "columns"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "hero"
  | "gallery"
  | "contact-form"
  | "embed"
  | "card-grid"
  | "testimonial"
  | "faq"
  | "podcast"
  | "navbar";

export interface BaseBlock {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  children?: Block[];
  // per-block overrides (optional, overrides site theme)
  style?: {
    backgroundColor?: string;
    textColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
  };
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  props: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5;
    align: "left" | "center" | "right";
  };
}

export interface TextBlock extends BaseBlock {
  type: "text";
  props: {
    html: string; // sanitised rich text
    align: "left" | "center" | "right";
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  props: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
    fit: "cover" | "contain" | "fill";
    rounded: boolean;
    caption?: string;
    href?: string;
  };
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  props: {
    label: string;
    href: string;
    variant: "primary" | "secondary" | "outline" | "ghost";
    align: "left" | "center" | "right";
    openInNewTab: boolean;
  };
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  props: { style: "line" | "dots" | "space" };
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  props: { height: number }; // px
}

export interface HeroBlock extends BaseBlock {
  type: "hero";
  props: {
    title: string;
    subtitle?: string;
    backgroundUrl?: string;
    backgroundOverlay: number; // 0-100
    buttonLabel?: string;
    buttonHref?: string;
    align: "left" | "center" | "right";
    minHeight: number; // px
  };
}

export interface SectionBlock extends BaseBlock {
  type: "section";
  props: {
    maxWidth: "sm" | "md" | "lg" | "xl" | "full";
    paddingX: "none" | "sm" | "md" | "lg";
  };
  children: Block[];
}

export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  props: {
    columns: 2 | 3 | 4;
    gap: "sm" | "md" | "lg";
    stackOnMobile: boolean;
  };
  children: Block[]; // first N = column contents (each a section-like wrapper)
}

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  props: {
    images: Array<{ url: string; alt: string; caption?: string }>;
    columns: 2 | 3 | 4;
    gap: "sm" | "md" | "lg";
    aspectRatio: "square" | "landscape" | "portrait";
  };
}

export interface ContactFormBlock extends BaseBlock {
  type: "contact-form";
  props: {
    title?: string;
    includeSubject: boolean;
    submitLabel: string;
    successMessage: string;
  };
}

export interface EmbedBlock extends BaseBlock {
  type: "embed";
  props: {
    url: string; // youtube / vimeo / google-maps
    aspectRatio: "16/9" | "4/3" | "1/1";
    caption?: string;
  };
}

export interface CardGridBlock extends BaseBlock {
  type: "card-grid";
  props: {
    cards: Array<{
      title: string;
      body: string;
      imageUrl?: string;
      href?: string;
    }>;
    columns: 2 | 3 | 4;
  };
}

export interface TestimonialBlock extends BaseBlock {
  type: "testimonial";
  props: {
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
  };
}

export interface FaqBlock extends BaseBlock {
  type: "faq";
  props: {
    items: Array<{ question: string; answer: string }>;
  };
}

export interface PodcastBlock extends BaseBlock {
  type: "podcast";
  props: {
    mode: "latest" | "single" | "link";
    title?: string;
    limit: number;
    episodeSlug?: string;
    showDescriptions: boolean;
    linkLabel: string;
  };
}

export interface NavbarBlock extends BaseBlock {
  type: "navbar";
  props: {
    sticky: boolean;
  };
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock
  | HeroBlock
  | SectionBlock
  | ColumnsBlock
  | GalleryBlock
  | ContactFormBlock
  | EmbedBlock
  | CardGridBlock
  | TestimonialBlock
  | FaqBlock
  | PodcastBlock
  | NavbarBlock;

// ─── Default props factories ───────────────────────────────────────────────
import { nanoid } from "./nanoid";

export function createBlock(type: BlockType): Block {
  const id = nanoid();
  switch (type) {
    case "heading":
      return { id, type, props: { text: "Nieuwe kop", level: 2, align: "left" } } as HeadingBlock;
    case "text":
      return { id, type, props: { html: "<p>Typ hier je tekst...</p>", align: "left" } } as TextBlock;
    case "image":
      return { id, type, props: { url: "", alt: "", fit: "cover", rounded: false } } as ImageBlock;
    case "button":
      return { id, type, props: { label: "Klik hier", href: "#", variant: "primary", align: "center", openInNewTab: false } } as ButtonBlock;
    case "divider":
      return { id, type, props: { style: "line" } } as DividerBlock;
    case "spacer":
      return { id, type, props: { height: 40 } } as SpacerBlock;
    case "hero":
      return { id, type, props: { title: "Welkom op onze website", subtitle: "Omschrijf hier waar je voor staat.", backgroundOverlay: 40, align: "center", minHeight: 500 } } as HeroBlock;
    case "section":
      return { id, type, props: { maxWidth: "lg", paddingX: "md" }, children: [] } as SectionBlock;
    case "columns":
      return { id, type, props: { columns: 2, gap: "md", stackOnMobile: true }, children: [
        { id: nanoid(), type: "section", props: { maxWidth: "full", paddingX: "none" }, children: [] } as SectionBlock,
        { id: nanoid(), type: "section", props: { maxWidth: "full", paddingX: "none" }, children: [] } as SectionBlock,
      ] } as ColumnsBlock;
    case "gallery":
      return { id, type, props: { images: [], columns: 3, gap: "md", aspectRatio: "square" } } as GalleryBlock;
    case "contact-form":
      return { id, type, props: { includeSubject: true, submitLabel: "Versturen", successMessage: "Bedankt! We nemen zo snel mogelijk contact met je op." } } as ContactFormBlock;
    case "embed":
      return { id, type, props: { url: "", aspectRatio: "16/9" } } as EmbedBlock;
    case "card-grid":
      return { id, type, props: { cards: [{ title: "Kaart 1", body: "Omschrijving" }], columns: 3 } } as CardGridBlock;
    case "testimonial":
      return { id, type, props: { quote: "Dit is een geweldige dienst!", author: "Jan de Vries" } } as TestimonialBlock;
    case "faq":
      return { id, type, props: { items: [{ question: "Veelgestelde vraag", answer: "Antwoord" }] } } as FaqBlock;
    case "podcast":
      return {
        id,
        type,
        props: {
          mode: "latest",
          title: "Podcast",
          limit: 3,
          showDescriptions: true,
          linkLabel: "Alle afleveringen",
        },
      } as PodcastBlock;
    case "navbar":
      return { id, type, props: { sticky: false } } as NavbarBlock;
  }
}
