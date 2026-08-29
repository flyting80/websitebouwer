/**
 * Vult de lokale database met een demo-site en een testgebruiker.
 * Gebruik: npx tsx scripts/seed-demo.ts
 *
 * Na het seeden kun je inloggen met: test@websitebeheer.local
 * (magic-link wordt overgeslagen — sessie wordt direct aangemaakt)
 */
import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const dbPath = path.join(process.cwd(), "local.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

// ── 1. Testgebruiker ──────────────────────────────────────────────────────────
const userId = id();
db.prepare(`
  INSERT OR IGNORE INTO users (id, email, name, created_at)
  VALUES (?, ?, ?, ?)
`).run(userId, "test@websitebeheer.local", "Websitebeheertool Testgebruiker", now());

// ── 2. Sessie aanmaken (directe toegang zonder e-mail) ────────────────────────
const sessionToken = crypto.randomBytes(32).toString("hex");
const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
db.prepare(`
  INSERT OR REPLACE INTO sessions (session_token, user_id, expires)
  VALUES (?, ?, ?)
`).run(sessionToken, userId, expires);

// ── 3. Demo-site: Schatgraven met kinderen ────────────────────────────────────
const siteId = id();
db.prepare(`
  INSERT OR IGNORE INTO sites (id, name, slug, contact_email, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(siteId, "Schatgraven met kinderen", "schatgraven", "info@schatgravenmetkinderen.nl", now(), now());

// Theme
db.prepare(`
  INSERT OR IGNORE INTO site_themes (site_id, color_primary, color_secondary, color_accent,
    color_background, color_surface, color_text, color_text_muted,
    font_heading, font_body, border_radius, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(siteId, "#b45309", "#78350f", "#fbbf24", "#fffbf0", "#ffffff", "#1c1917", "#78716c",
  "Playfair Display", "Inter", "0.75rem", now());

// Settings
db.prepare(`
  INSERT OR IGNORE INTO site_settings (site_id, cookie_banner_enabled, updated_at)
  VALUES (?, 1, ?)
`).run(siteId, now());

// ── 4. Homepagina met demo-blokken ────────────────────────────────────────────
const homePageId = id();
const homeBlocks = JSON.stringify([
  {
    id: "hero-1",
    type: "hero",
    props: {
      title: "Schatgraven met kinderen",
      subtitle: "Ontdek de leukste schatgraafavonturen voor het hele gezin!",
      backgroundUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600",
      backgroundOverlay: 45,
      align: "center",
      minHeight: 550,
      buttonLabel: "Bekijk de activiteiten",
      buttonHref: "/activiteiten",
    },
  },
  {
    id: "sec-1",
    type: "section",
    props: { maxWidth: "lg", paddingX: "md" },
    children: [
      {
        id: "h2-1",
        type: "heading",
        props: { text: "Waarom schatgraven?", level: 2, align: "center" },
      },
      {
        id: "txt-1",
        type: "text",
        props: {
          html: "<p>Schatgraven is een geweldige manier om kinderen buiten te laten spelen, terwijl ze ook nog eens leren over geschiedenis en natuur. We organiseren speurtochten en schatgraafavonturen voor kinderen van alle leeftijden.</p>",
          align: "center",
        },
      },
    ],
  },
  {
    id: "cols-1",
    type: "columns",
    props: { columns: 3, gap: "md", stackOnMobile: true },
    children: [
      {
        id: "col-a",
        type: "section",
        props: { maxWidth: "full", paddingX: "md" },
        children: [
          { id: "h3a", type: "heading", props: { text: "🏴‍☠️ Piratenroute", level: 3, align: "center" } },
          { id: "ta", type: "text", props: { html: "<p>Volg de aanwijzingen en vind de verborgen schat!</p>", align: "center" } },
        ],
      },
      {
        id: "col-b",
        type: "section",
        props: { maxWidth: "full", paddingX: "md" },
        children: [
          { id: "h3b", type: "heading", props: { text: "🔍 Detectivetocht", level: 3, align: "center" } },
          { id: "tb", type: "text", props: { html: "<p>Los de raadsels op en ontdek het mysterie!</p>", align: "center" } },
        ],
      },
      {
        id: "col-c",
        type: "section",
        props: { maxWidth: "full", paddingX: "md" },
        children: [
          { id: "h3c", type: "heading", props: { text: "⚗️ Archeologie", level: 3, align: "center" } },
          { id: "tc", type: "text", props: { html: "<p>Graaf op zoek naar echte historische vondsten!</p>", align: "center" } },
        ],
      },
    ],
  },
  {
    id: "testimonial-1",
    type: "testimonial",
    props: {
      quote: "Mijn kinderen hebben dit de beste dag van het jaar gevonden! Absoluut aanraden.",
      author: "Marieke van der Berg",
      role: "Moeder van 3 kinderen",
    },
  },
  {
    id: "contact-1",
    type: "contact-form",
    props: {
      title: "Neem contact op",
      includeSubject: true,
      submitLabel: "Stuur een bericht",
      successMessage: "Bedankt! We nemen zo snel mogelijk contact met je op.",
    },
  },
]);

db.prepare(`
  INSERT OR IGNORE INTO pages (id, site_id, title, slug, page_type, draft_blocks, live_blocks,
    is_published, sort_order, show_in_nav, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, ?)
`).run(homePageId, siteId, "Home", "", "home", homeBlocks, homeBlocks, now(), now());

// ── 5. Over ons pagina ────────────────────────────────────────────────────────
const aboutPageId = id();
const aboutBlocks = JSON.stringify([
  {
    id: "hero-about",
    type: "hero",
    props: {
      title: "Over ons",
      subtitle: "Wie zijn wij en wat drijft ons?",
      backgroundOverlay: 40,
      align: "center",
      minHeight: 300,
    },
  },
  {
    id: "about-text",
    type: "section",
    props: { maxWidth: "md", paddingX: "md" },
    children: [
      {
        id: "about-h2",
        type: "heading",
        props: { text: "Ons verhaal", level: 2, align: "left" },
      },
      {
        id: "about-p",
        type: "text",
        props: {
          html: "<p>Wij zijn een enthousiast team van avonturiers die het leuk vinden om kinderen buiten te laten spelen en te ontdekken. Onze speurtochten zijn ontworpen voor kinderen van 4 tot 14 jaar.</p><p>Elke route is zorgvuldig uitgedacht en regelmatig vernieuwd, zodat er altijd iets nieuws te beleven is!</p>",
          align: "left",
        },
      },
    ],
  },
]);

db.prepare(`
  INSERT OR IGNORE INTO pages (id, site_id, title, slug, page_type, draft_blocks, live_blocks,
    is_published, sort_order, show_in_nav, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?)
`).run(aboutPageId, siteId, "Over ons", "over-ons", "page", aboutBlocks, aboutBlocks, now(), now());

// ── 6. Navigatie-items ────────────────────────────────────────────────────────
const navData = [
  { label: "Home", href: "/", sort: 0 },
  { label: "Over ons", href: "/over-ons", sort: 1 },
  { label: "Activiteiten", href: "/activiteiten", sort: 2 },
  { label: "Blog", href: "/blog", sort: 3 },
  { label: "Contact", href: "/contact", sort: 4 },
];

for (const nav of navData) {
  db.prepare(`
    INSERT OR IGNORE INTO nav_items (id, site_id, label, href, sort_order, open_in_new_tab)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(id(), siteId, nav.label, nav.href, nav.sort);
}

// ── 7. Demo blog-artikel ──────────────────────────────────────────────────────
const blogPostId = id();
const blogBlocks = JSON.stringify([
  { id: "bp-h1", type: "heading", props: { text: "5 tips voor de beste schatgraafdag", level: 2, align: "left" } },
  { id: "bp-t1", type: "text", props: { html: "<p>Planning is alles bij een schatgraafdag. Hier zijn onze 5 beste tips om er een onvergetelijke dag van te maken voor de hele familie.</p>", align: "left" } },
  { id: "bp-h2", type: "heading", props: { text: "1. Zorg voor de juiste uitrusting", level: 3, align: "left" } },
  { id: "bp-t2", type: "text", props: { html: "<p>Neem voldoende water mee, draag laarzen en vergeet de schep niet. Een vergrootglas is ook leuk voor de kleintjes!</p>", align: "left" } },
]);

db.prepare(`
  INSERT OR IGNORE INTO blog_posts (id, site_id, title, slug, excerpt, content, author_name,
    status, published_at, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  blogPostId, siteId,
  "5 tips voor de beste schatgraafdag",
  "5-tips-schatgraafdag",
  "Planning is alles bij een schatgraafdag. Lees onze beste tips.",
  JSON.stringify(blogBlocks),
  "Team Schatgraven",
  "published",
  now(), now(), now()
);

// ── 8. Demo contactbericht ────────────────────────────────────────────────────
db.prepare(`
  INSERT OR IGNORE INTO contact_submissions (id, site_id, name, email, subject, message, is_read, created_at)
  VALUES (?, ?, ?, ?, ?, ?, 0, ?)
`).run(
  id(), siteId,
  "Lisa Jansen",
  "lisa@voorbeeld.nl",
  "Vraag over de piratenroute",
  "Hallo, ik wil graag weten of de piratenroute ook geschikt is voor kinderen van 4 jaar. Alvast bedankt!",
  now()
);

console.log("✅ Demo-data aangemaakt!");
console.log("");
console.log("📋 Sessie-cookie voor directe toegang:");
console.log(`   Naam: authjs.session-token`);
console.log(`   Waarde: ${sessionToken}`);
console.log("");
console.log("🌐 Open: http://localhost:3001/admin");
console.log("   Voeg de cookie toe in DevTools > Application > Cookies");
console.log("   OF gebruik: http://localhost:3001/admin/dev-login");
console.log("");
console.log(`🏠 Site-ID: ${siteId}`);

db.close();
