/**
 * Import Cyber 2-ESCAPE marketing site into Websitebeheertool.
 * Usage (production):
 *   npx tsx --env-file=.env.local scripts/import-cyber2escape.ts
 *
 * Idempotent: deletes existing site with slug cyber2escape first.
 */
import { getDb } from "../lib/db";
import { sites, siteThemes, siteSettings, pages, navItems } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { newId } from "../lib/db/helpers";

const SLUG = "cyber2escape";
const DEMO_URL = "https://cyber2-escape.lovable.app"; // game / demo app
const SITE_URL_PREFIX = ""; // relative links within builder site

function id() {
  return newId();
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function p(html: string) {
  return `<p>${html}</p>`;
}

function homeBlocks() {
  return [
    {
      id: id(),
      type: "hero",
      props: {
        title: "Interactieve cyberincident-simulaties voor organisaties",
        subtitle:
          "Cyber 2-ESCAPE is een browsergebaseerd platform waarmee organisaties medewerkers laten oefenen met realistische cyberincidenten. Veilig, herkenbaar en zonder technische voorkennis.",
        backgroundOverlay: 55,
        align: "left",
        minHeight: 520,
        buttonLabel: "Speel gratis de demo (20 min)",
        buttonHref: "/demo",
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Probeer het zelf — 20 minuten, gratis", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          "Voordat u iets aanschaft, kunt u zelf ervaren hoe Cyber 2-Escape aanvoelt. Geen verplichtingen, geen technische voorkennis nodig — alleen uw naam en e-mailadres."
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Speel gratis de demo (20 min)",
        href: "/demo",
        variant: "primary",
        align: "left",
        openInNewTab: false,
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Waarom organisaties starten met een demo of pilot", level: 3, align: "left" },
    },
    {
      id: id(),
      type: "card-grid",
      props: {
        columns: 2,
        cards: [
          { title: "Eerst zelf ervaren", body: "Gratis demo van 20 minuten — zonder verplichtingen." },
          {
            title: "Pilot voor early adopters",
            body: "Begeleide sessie voor de eerste organisaties tegen gereduceerd tarief.",
          },
          {
            title: "Aantoonbaar oefenen",
            body: "Dashboard met voortgang en keuzes — naast bestaande e-learning.",
          },
          {
            title: "Geen IT-project",
            body: "Browser-only, toegangscode, geen installatie of accounts per speler.",
          },
        ],
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Eén platform voor cyberbewustzijn", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html:
          p(
            "Cyber 2-ESCAPE is een platform voor interactieve cyberincident-simulaties. Via één browseromgeving oefenen medewerkers met realistische situaties waarin zij signalen herkennen, informatie combineren en de juiste keuzes maken."
          ) + p("<em>Nu beschikbaar: Digitale Infiltratie. Er worden nieuwe scenario's ontwikkeld.</em>"),
        align: "left",
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Van kennis naar handelen", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html:
          p(
            "Kennis alleen is niet genoeg. Organisaties investeren in e-learning en phishingtests, maar gedrag onder druk blijft lastig. Cyber 2-ESCAPE laat medewerkers oefenen met signaleren, analyseren, samenwerken, besluiten nemen en escaleren in een realistische context."
          ) +
          p(
            "De simulatie vormt een aanvulling op bestaande awarenessprogramma's en biedt inzicht in gemaakte keuzes, momenten van twijfel en verbeterpunten."
          ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Hoe werkt het platform?", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "card-grid",
      props: {
        columns: 3,
        cards: [
          { title: "Browser-only", body: "Geen installatie, alleen een moderne browser." },
          { title: "Individueel of teammodus", body: "Zelfstandig of samen spelen en beslissen." },
          { title: "Dashboard", body: "Inzicht in voortgang en gemaakte keuzes." },
          { title: "Multi-tenant", body: "Meerdere organisaties op één platform." },
          { title: "Eigen branding mogelijk", body: "Logo en huisstijl van uw organisatie." },
          { title: "Veilige hosting", body: "Gesimuleerde omgeving, geen echte systemen." },
        ],
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Scenario: Digitale Infiltratie", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          "Onderzoek een mogelijk cyberincident in een Nederlandse organisatie — via e-mail, intranet en interne systemen. <strong>60–90 min · Niet-technisch · Beschikbaar</strong>"
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Bekijk het scenario",
        href: "/scenario-digitale-infiltratie",
        variant: "outline",
        align: "left",
        openInNewTab: false,
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Voor wie?", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "card-grid",
      props: {
        columns: 2,
        cards: [
          { title: "Gemeenten", body: "Praktische oefening naast e-learning en NIS2-verplichtingen." },
          { title: "Overheden", body: "Aantoonbare bewustwording voor BIO en ENSIA." },
          { title: "Onderwijsinstellingen", body: "Engagement voor alle functies, van receptie tot directie." },
          { title: "Bedrijven", body: "Train het menselijke deel van uw verdedigingslinie." },
        ],
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Aansluitend op wat u al moet aantonen", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          "Bewustwording is onderdeel van wat organisaties moeten aantonen binnen <strong>NIS2</strong>, de <strong>BIO</strong> en de <strong>AVG</strong>. Cyber 2-ESCAPE biedt een aanvullende, aantoonbare oefenvorm naast bestaande e-learning."
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Laagdrempelig starten", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "card-grid",
      props: {
        columns: 2,
        cards: [
          { title: "Individueel — 10 deelnemers", body: "€99", href: "/prijzen" },
          { title: "Individueel — 25 deelnemers", body: "€199", href: "/prijzen" },
          { title: "Teammodus — tot 25 deelnemers", body: "€295", href: "/prijzen" },
          { title: "Teammodus — tot 50 deelnemers", body: "€495", href: "/prijzen" },
        ],
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Bekijk alle prijzen",
        href: "/prijzen",
        variant: "secondary",
        align: "left",
        openInNewTab: false,
      },
    },
    { id: id(), type: "spacer", props: { height: 24 } },
    {
      id: id(),
      type: "button",
      props: {
        label: "Vraag een pilot aan",
        href: "/pilot",
        variant: "primary",
        align: "center",
        openInNewTab: false,
      },
    },
  ];
}

function demoBlocks() {
  return [
    {
      id: id(),
      type: "hero",
      props: {
        title: "Speel gratis de demo (20 min)",
        subtitle:
          "Ervaar zelf hoe Cyber 2-Escape aanvoelt — zonder verplichtingen en zonder technische voorkennis.",
        backgroundOverlay: 50,
        align: "left",
        minHeight: 360,
        buttonLabel: "Start de demo",
        buttonHref: DEMO_URL,
      },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          "De demo duurt ongeveer 20 minuten. U speelt in de browser op het Cyber 2-ESCAPE-platform. Na de demo kunt u een pilot of pakket aanvragen."
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Open demo-omgeving",
        href: DEMO_URL,
        variant: "primary",
        align: "left",
        openInNewTab: true,
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Liever een pilot aanvragen",
        href: "/pilot",
        variant: "outline",
        align: "left",
        openInNewTab: false,
      },
    },
  ];
}

function scenarioBlocks() {
  return [
    {
      id: id(),
      type: "hero",
      props: {
        title: "Digitale Infiltratie",
        subtitle: "60–90 minuten · Niet-technisch · Beschikbaar",
        backgroundOverlay: 50,
        align: "left",
        minHeight: 360,
      },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          "Onderzoek een mogelijk cyberincident in een Nederlandse organisatie — via e-mail, intranet en interne systemen. Deelnemers herkennen signalen, combineren informatie en maken keuzes onder tijdsdruk."
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Speel gratis de demo (20 min)",
        href: "/demo",
        variant: "primary",
        align: "left",
        openInNewTab: false,
      },
    },
  ];
}

function pricingBlocks() {
  return [
    {
      id: id(),
      type: "hero",
      props: {
        title: "Laagdrempelig starten",
        subtitle:
          "Cyber 2-ESCAPE is beschikbaar vanaf een klein aantal deelnemers, zodat u eenvoudig kunt uitproberen of deze vorm van leren bij uw organisatie past.",
        backgroundOverlay: 45,
        align: "left",
        minHeight: 320,
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Individueel", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: `<ul><li>Eigen speelsessie met toegangscode</li><li>Volledig scenario Digitale Infiltratie (60–90 min)</li><li>Resultaat en voortgang inzichtelijk voor de organisatie</li><li>Speelbaar in de browser, zonder installatie</li></ul>`,
        align: "left",
      },
    },
    {
      id: id(),
      type: "card-grid",
      props: {
        columns: 2,
        cards: [
          { title: "10 deelnemers", body: "€99" },
          { title: "25 deelnemers", body: "€199" },
          { title: "50 deelnemers", body: "€349" },
          { title: "100 deelnemers", body: "€599" },
        ],
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Teammodus", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: `<ul><li>Alles van individueel</li><li>Maximaal 4 personen samen op één code</li><li>Samen overleggen en beslissen onder tijdsdruk</li><li>Geschikt voor teamtraining of een ochtendsessie</li></ul>`,
        align: "left",
      },
    },
    {
      id: id(),
      type: "card-grid",
      props: {
        columns: 3,
        cards: [
          { title: "Tot 25 deelnemers", body: "€295" },
          { title: "Tot 50 deelnemers", body: "€495" },
          { title: "Tot 100 deelnemers", body: "€795" },
        ],
      },
    },
    {
      id: id(),
      type: "heading",
      props: { text: "Maatwerk", level: 2, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p("<strong>Vanaf €995</strong> — branding, extra begeleiding of scenario-aanpassingen op verzoek."),
        align: "left",
      },
    },
    {
      id: id(),
      type: "faq",
      props: {
        items: [
          {
            question: "Is er een minimale afname?",
            answer: "U kunt starten vanaf 10 deelnemers (individueel) of een teampakket tot 25 deelnemers.",
          },
          {
            question: "Wat is het verschil tussen individueel en teammodus?",
            answer:
              "In de individuele modus speelt elke deelnemer zelfstandig. In de teammodus werken maximaal 4 deelnemers samen op één code.",
          },
          {
            question: "Wat houdt de pilotaanbieding in?",
            answer:
              "Een begeleide sessie tot 25 deelnemers voor €195 (regulier €295), inclusief introductie, begeleiding en nabespreking.",
          },
        ],
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Vraag een pilot aan",
        href: "/pilot",
        variant: "primary",
        align: "left",
        openInNewTab: false,
      },
    },
  ];
}

function faqBlocks() {
  return [
    {
      id: id(),
      type: "heading",
      props: { text: "Veelgestelde vragen", level: 1, align: "left" },
    },
    {
      id: id(),
      type: "faq",
      props: {
        items: [
          {
            question: "Is technische voorkennis nodig?",
            answer:
              "Nee, de simulatie is gebouwd voor niet-technische medewerkers. Deelnemers werken met herkenbare tools zoals e-mail en een browser.",
          },
          {
            question: "Hoe lang duurt een sessie?",
            answer:
              "Het scenario Digitale Infiltratie duurt typisch 60–90 minuten. De gratis demo duurt circa 20 minuten.",
          },
          {
            question: "Werkt dit op elk apparaat?",
            answer:
              "Ja, volledig via de browser, zonder installatie. We raden desktop of laptop aan (minimaal ongeveer 13 inch).",
          },
          {
            question: "Hebben we de IT-afdeling nodig om te starten?",
            answer: "Nee. Alles draait in de browser. De organisatie ontvangt toegangscodes; deelnemers loggen zelf in.",
          },
          {
            question: "Past dit bij NIS2 of awareness-beleid?",
            answer:
              "Cyber 2-ESCAPE helpt organisaties medewerkers te laten oefenen met herkennen en handelen bij incidenten — een praktijkgerichte aanvulling op awareness-beleid.",
          },
          {
            question: "Is dit hetzelfde als een phishingtest?",
            answer:
              "Nee. Phishingtests meten vooral klikgedrag. Cyber 2-ESCAPE oefent beoordelen, verbanden leggen en handelen in een realistische werkdag-simulatie.",
          },
          {
            question: "Wat kost het?",
            answer: "Zie de prijspagina — vanaf €99 voor 10 deelnemers. Er is ook een pilotaanbieding beschikbaar.",
          },
          {
            question: "Welke ondersteuning krijgen we bij een pilot?",
            answer: "Introductie, begeleiding tijdens de sessie en een gezamenlijke nabespreking.",
          },
        ],
      },
    },
  ];
}

function contactBlocks() {
  return [
    {
      id: id(),
      type: "heading",
      props: { text: "Contact", level: 1, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          'Heb je een vraag over Cyber 2-ESCAPE, een pilot of een offerte? Stuur een bericht — of mail naar <a href="mailto:info@cyber2escape.nl">info@cyber2escape.nl</a>.'
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "contact-form",
      props: {
        title: "Stuur een bericht",
        includeSubject: true,
        submitLabel: "Versturen",
        successMessage: "Bedankt! We nemen zo snel mogelijk contact met je op.",
      },
    },
  ];
}

function pilotBlocks() {
  return [
    {
      id: id(),
      type: "hero",
      props: {
        title: "Vraag een pilot aan",
        subtitle:
          "Begeleide sessie tot 25 deelnemers voor early adopters — inclusief introductie, begeleiding en nabespreking.",
        backgroundOverlay: 50,
        align: "left",
        minHeight: 360,
      },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          "Vul het formulier in. We nemen contact op om de pilot in te plannen. Pilotaanbieding beschikbaar tot 31 december 2026."
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "contact-form",
      props: {
        title: "Pilot aanvragen",
        includeSubject: true,
        submitLabel: "Verstuur aanvraag",
        successMessage: "Bedankt voor je aanvraag. We nemen snel contact op.",
      },
    },
  ];
}

function overOnsBlocks() {
  return [
    {
      id: id(),
      type: "heading",
      props: { text: "Over Cyber 2-ESCAPE", level: 1, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html:
          p(
            "Cyber 2-ESCAPE is een browsergebaseerd platform voor interactieve cyberincident-simulaties. Organisaties laten medewerkers oefenen met realistische situaties — veilig, herkenbaar en zonder technische voorkennis."
          ) +
          p(
            'Vragen? Mail <a href="mailto:info@cyber2escape.nl">info@cyber2escape.nl</a> of gebruik het <a href="/contact">contactformulier</a>.'
          ),
        align: "left",
      },
    },
  ];
}

function voorOrgBlocks() {
  return [
    {
      id: id(),
      type: "heading",
      props: { text: "Voor organisaties", level: 1, align: "left" },
    },
    {
      id: id(),
      type: "text",
      props: {
        html: p(
          "Cyber 2-ESCAPE past bij gemeenten, overheden, onderwijs en bedrijven die aantoonbaar willen oefenen met cyberbewustzijn — naast bestaande e-learning."
        ),
        align: "left",
      },
    },
    {
      id: id(),
      type: "card-grid",
      props: {
        columns: 2,
        cards: [
          { title: "Gemeenten", body: "Praktische oefening naast e-learning en NIS2-verplichtingen." },
          { title: "Overheden", body: "Aantoonbare bewustwording voor BIO en ENSIA." },
          { title: "Onderwijsinstellingen", body: "Engagement voor alle functies, van receptie tot directie." },
          { title: "Bedrijven", body: "Train het menselijke deel van uw verdedigingslinie." },
        ],
      },
    },
    {
      id: id(),
      type: "button",
      props: {
        label: "Neem contact op",
        href: "/contact",
        variant: "primary",
        align: "left",
        openInNewTab: false,
      },
    },
  ];
}

function pageDefs() {
  return [
    {
      title: "Home",
      slug: "",
      pageType: "home",
      blocks: homeBlocks(),
      seoTitle: "Cyber 2-ESCAPE | Interactieve cyberincident-simulatie",
      seoDescription:
        "Laat medewerkers oefenen met echte cyberincidenten in een veilige, browsergebaseerde simulatie. Vanaf €99. Speel gratis de demo (20 min).",
      showInNav: false,
      sortOrder: 0,
    },
    {
      title: "Demo",
      slug: "demo",
      pageType: "page",
      blocks: demoBlocks(),
      seoTitle: "Gratis demo | Cyber 2-ESCAPE",
      seoDescription: "Speel gratis de demo van Cyber 2-ESCAPE (20 minuten).",
      showInNav: true,
      sortOrder: 1,
    },
    {
      title: "Scenario Digitale Infiltratie",
      slug: "scenario-digitale-infiltratie",
      pageType: "page",
      blocks: scenarioBlocks(),
      seoTitle: "Digitale Infiltratie | Cyber 2-ESCAPE",
      seoDescription: "Scenario Digitale Infiltratie — 60–90 minuten, niet-technisch.",
      showInNav: true,
      sortOrder: 2,
    },
    {
      title: "Prijzen",
      slug: "prijzen",
      pageType: "page",
      blocks: pricingBlocks(),
      seoTitle: "Prijzen | Cyber 2-ESCAPE",
      seoDescription: "Transparante prijzen vanaf €99 voor 10 deelnemers.",
      showInNav: true,
      sortOrder: 3,
    },
    {
      title: "Pilot",
      slug: "pilot",
      pageType: "page",
      blocks: pilotBlocks(),
      seoTitle: "Pilot aanvragen | Cyber 2-ESCAPE",
      seoDescription: "Vraag een begeleide pilot aan voor Cyber 2-ESCAPE.",
      showInNav: true,
      sortOrder: 4,
    },
    {
      title: "Voor organisaties",
      slug: "voor-organisaties",
      pageType: "page",
      blocks: voorOrgBlocks(),
      seoTitle: "Voor organisaties | Cyber 2-ESCAPE",
      seoDescription: "Cyber 2-ESCAPE voor gemeenten, overheden, onderwijs en bedrijven.",
      showInNav: true,
      sortOrder: 5,
    },
    {
      title: "FAQ",
      slug: "faq",
      pageType: "page",
      blocks: faqBlocks(),
      seoTitle: "FAQ | Cyber 2-ESCAPE",
      seoDescription: "Veelgestelde vragen over Cyber 2-ESCAPE.",
      showInNav: true,
      sortOrder: 6,
    },
    {
      title: "Contact",
      slug: "contact",
      pageType: "page",
      blocks: contactBlocks(),
      seoTitle: "Contact | Cyber 2-ESCAPE",
      seoDescription: "Neem contact op over Cyber 2-ESCAPE.",
      showInNav: true,
      sortOrder: 7,
    },
    {
      title: "Over ons",
      slug: "over-ons",
      pageType: "page",
      blocks: overOnsBlocks(),
      seoTitle: "Over ons | Cyber 2-ESCAPE",
      seoDescription: "Over Cyber 2-ESCAPE.",
      showInNav: true,
      sortOrder: 8,
    },
  ];
}

function lit(s: string) {
  return `'${s.replace(/'/g, "''")}'`;
}

function jsonb(value: unknown) {
  return `${lit(JSON.stringify(value))}::jsonb`;
}

function buildSql(siteId: string): string {
  const lines: string[] = [];
  lines.push(`-- Cyber 2-ESCAPE import`);
  lines.push(`DELETE FROM sites WHERE slug = ${lit(SLUG)};`);
  lines.push(
    `INSERT INTO sites (id, name, slug, domain, contact_email) VALUES (${lit(siteId)}, ${lit("Cyber 2-ESCAPE")}, ${lit(SLUG)}, ${lit("cyber2-escape.nl")}, ${lit("info@cyber2escape.nl")});`
  );
  lines.push(
    `INSERT INTO site_themes (site_id, color_primary, color_secondary, color_accent, color_background, color_surface, color_text, color_text_muted, font_heading, font_body, border_radius) VALUES (${lit(siteId)}, '#0C7CE8', '#37404A', '#22B5A6', '#F7F9FB', '#FFFFFF', '#1D2630', '#58636E', 'Inter', 'Inter', '0.5rem');`
  );
  lines.push(
    `INSERT INTO site_settings (site_id, cookie_banner_enabled, footer_text, header_enabled, header_sticky, header_tagline) VALUES (${lit(siteId)}, true, ${lit("© Cyber 2-ESCAPE — Interactieve cyberincident-simulaties")}, true, true, ${lit("Cyber Awareness Platform")});`
  );

  for (const page of pageDefs()) {
    const blocks = page.blocks;
    lines.push(
      `INSERT INTO pages (id, site_id, title, slug, page_type, draft_blocks, live_blocks, draft_blocks_mobile, live_blocks_mobile, seo_title, seo_description, is_published, published_at, show_in_nav, sort_order) VALUES (${lit(id())}, ${lit(siteId)}, ${lit(page.title)}, ${lit(page.slug)}, ${lit(page.pageType)}, ${jsonb(blocks)}, ${jsonb(blocks)}, '[]'::jsonb, '[]'::jsonb, ${lit(page.seoTitle)}, ${lit(page.seoDescription)}, true, now(), ${page.showInNav}, ${page.sortOrder});`
    );
  }

  const nav = [
    { label: "Home", href: "/", sort: 0 },
    { label: "Demo", href: "/demo", sort: 1 },
    { label: "Scenario", href: "/scenario-digitale-infiltratie", sort: 2 },
    { label: "Prijzen", href: "/prijzen", sort: 3 },
    { label: "Pilot", href: "/pilot", sort: 4 },
    { label: "Voor organisaties", href: "/voor-organisaties", sort: 5 },
    { label: "FAQ", href: "/faq", sort: 6 },
    { label: "Contact", href: "/contact", sort: 7 },
  ];

  for (const n of nav) {
    lines.push(
      `INSERT INTO nav_items (id, site_id, label, href, sort_order, placement, visibility) VALUES (${lit(id())}, ${lit(siteId)}, ${lit(n.label)}, ${lit(n.href)}, ${n.sort}, 'both', 'both');`
    );
  }

  return lines.join("\n");
}

async function main() {
  const emitSql = process.argv.includes("--emit-sql");
  const siteId = id();

  if (emitSql) {
    const { writeFileSync } = await import("fs");
    const { join } = await import("path");
    const out = join(process.cwd(), "scripts", "_cyber2escape-import.sql");
    writeFileSync(out, buildSql(siteId), "utf8");
    console.log(`Wrote ${out}`);
    console.log(`Site ID: ${siteId}`);
    return;
  }

  const db = getDb();

  const existing = await db.select().from(sites).where(eq(sites.slug, SLUG));
  if (existing.length) {
    console.log(`Site '${SLUG}' bestaat al — verwijderen voor schone import…`);
    await db.delete(sites).where(eq(sites.slug, SLUG));
  }

  await db.insert(sites).values({
    id: siteId,
    name: "Cyber 2-ESCAPE",
    slug: SLUG,
    domain: "cyber2-escape.nl",
    contactEmail: "info@cyber2escape.nl",
  });

  await db.insert(siteThemes).values({
    siteId,
    colorPrimary: "#0C7CE8",
    colorSecondary: "#37404A",
    colorAccent: "#22B5A6",
    colorBackground: "#F7F9FB",
    colorSurface: "#FFFFFF",
    colorText: "#1D2630",
    colorTextMuted: "#58636E",
    fontHeading: "Inter",
    fontBody: "Inter",
    borderRadius: "0.5rem",
  });

  await db.insert(siteSettings).values({
    siteId,
    cookieBannerEnabled: true,
    footerText: "© Cyber 2-ESCAPE — Interactieve cyberincident-simulaties",
    headerEnabled: true,
    headerSticky: true,
    headerTagline: "Cyber Awareness Platform",
  });

  for (const page of pageDefs()) {
    const blocks = page.blocks as unknown as object[];
    await db.insert(pages).values({
      id: id(),
      siteId,
      title: page.title,
      slug: page.slug,
      pageType: page.pageType,
      draftBlocks: blocks as never,
      liveBlocks: blocks as never,
      draftBlocksMobile: [] as never,
      liveBlocksMobile: [] as never,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      isPublished: true,
      publishedAt: new Date(),
      showInNav: page.showInNav,
      sortOrder: page.sortOrder,
    });
  }

  const nav = [
    { label: "Home", href: "/", sort: 0 },
    { label: "Demo", href: "/demo", sort: 1 },
    { label: "Scenario", href: "/scenario-digitale-infiltratie", sort: 2 },
    { label: "Prijzen", href: "/prijzen", sort: 3 },
    { label: "Pilot", href: "/pilot", sort: 4 },
    { label: "Voor organisaties", href: "/voor-organisaties", sort: 5 },
    { label: "FAQ", href: "/faq", sort: 6 },
    { label: "Contact", href: "/contact", sort: 7 },
  ];

  await db.insert(navItems).values(
    nav.map((n) => ({
      id: id(),
      siteId,
      label: n.label,
      href: n.href,
      sortOrder: n.sort,
      placement: "both",
      visibility: "both",
    }))
  );

  console.log("✅ Cyber 2-ESCAPE geïmporteerd");
  console.log(`   Site ID: ${siteId}`);
  console.log(`   Live:    /${SLUG}`);
  console.log(`   Admin:   /admin/sites → Cyber 2-ESCAPE`);
  void SITE_URL_PREFIX;
  void esc;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
