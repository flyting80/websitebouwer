/**
 * Geautomatiseerde API-test voor Websitebeheertool
 * Gebruik: npx tsx scripts/test-api.ts
 *
 * Test alle belangrijke API-endpoints met de lokale SQLite-database.
 */
import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const BASE_URL = "http://localhost:3001";

// Get session token from DB
const dbPath = path.join(process.cwd(), "local.db");
const db = new Database(dbPath);
const now = new Date().toISOString();
const session = db.prepare("SELECT session_token FROM sessions WHERE expires > ? LIMIT 1").get(now) as { session_token: string } | undefined;
db.close();

if (!session) {
  console.error("❌ Geen geldige sessie gevonden. Voer eerst: npx tsx scripts/seed-demo.ts");
  process.exit(1);
}

const COOKIE = `authjs.session-token=${session.session_token}`;
let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: unknown) {
    console.error(`  ❌ ${name}: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: COOKIE },
  });
  return { status: res.status, body: await res.json() };
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: COOKIE },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function patch(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: COOKIE },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function del(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: { Cookie: COOKIE },
  });
  return { status: res.status, body: await res.json() };
}

async function runTests() {
console.log("\n🧪 Websitebeheertool API Tests\n");

// ── Authenticatie ──────────────────────────────────────────────────────────
console.log("▶ Authenticatie");
await test("GET /api/auth/session geeft sessie terug", async () => {
  const res = await fetch(`${BASE_URL}/api/auth/session`, { headers: { Cookie: COOKIE } });
  const data = await res.json();
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
  if (!data.user) throw new Error("Geen user in sessie");
});

await test("GET /api/admin/sites zonder cookie → 401", async () => {
  const res = await fetch(`${BASE_URL}/api/admin/sites`);
  if (res.status !== 401) throw new Error(`Verwacht 401, kreeg ${res.status}`);
});

// ── Sites ──────────────────────────────────────────────────────────────────
console.log("\n▶ Sites");
let siteId: string;
let newSiteId: string;

await test("GET /api/admin/sites geeft lijst terug", async () => {
  const { status, body } = await get("/api/admin/sites");
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!Array.isArray(body)) throw new Error("Geen array");
  if (body.length === 0) throw new Error("Lege lijst — seed niet uitgevoerd?");
  siteId = body[0].id;
  console.log(`     → ${body.length} site(s) gevonden, eerste: ${body[0].name}`);
});

await test("POST /api/admin/sites maakt nieuwe site aan", async () => {
  const slug = `test-site-${Date.now()}`;
  const { status, body } = await post("/api/admin/sites", {
    name: "Test Site",
    slug,
    contactEmail: "test@test.nl",
  });
  if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(body)}`);
  if (!body.id) throw new Error("Geen ID in response");
  newSiteId = body.id;
  console.log(`     → Aangemaakt: ${body.name} (${body.id})`);
});

await test("PATCH /api/admin/sites/[id] past naam aan", async () => {
  const { status, body } = await patch(`/api/admin/sites/${newSiteId}`, { name: "Test Site (aangepast)" });
  if (status !== 200) throw new Error(`Status ${status}`);
  if (body.name !== "Test Site (aangepast)") throw new Error("Naam niet aangepast");
});

// ── Pagina's ───────────────────────────────────────────────────────────────
console.log("\n▶ Pagina's");
let pageId: string;

await test("GET /api/admin/pages?siteId=... geeft lijst terug", async () => {
  const { status, body } = await get(`/api/admin/pages?siteId=${siteId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!Array.isArray(body)) throw new Error("Geen array");
  console.log(`     → ${body.length} pagina('s)`);
});

await test("POST /api/admin/pages maakt pagina aan", async () => {
  const { status, body } = await post("/api/admin/pages", {
    siteId,
    title: "Testpagina",
    slug: `test-${Date.now()}`,
    pageType: "page",
  });
  if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(body)}`);
  pageId = body.id;
  console.log(`     → Aangemaakt: ${body.title}`);
});

await test("PATCH /api/admin/pages/[id] past blokken aan", async () => {
  const blocks = [{ id: "h1", type: "heading", props: { text: "Test", level: 2, align: "left" } }];
  const { status, body } = await patch(`/api/admin/pages/${pageId}`, { draftBlocks: blocks });
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!body.draftBlocks) throw new Error("Geen draftBlocks in response");
});

await test("POST /api/admin/pages/[id]/publish publiceert pagina", async () => {
  const { status, body } = await post(`/api/admin/pages/${pageId}/publish`, {});
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!body.isPublished) throw new Error("Pagina niet gepubliceerd");
  console.log(`     → Gepubliceerd op: ${body.publishedAt}`);
});

await test("DELETE /api/admin/pages/[id] verwijdert pagina", async () => {
  const { status } = await del(`/api/admin/pages/${pageId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
});

// ── Thema ──────────────────────────────────────────────────────────────────
console.log("\n▶ Thema");

await test("GET /api/admin/theme?siteId=... geeft thema terug", async () => {
  const { status, body } = await get(`/api/admin/theme?siteId=${siteId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!body.colorPrimary) throw new Error("Geen colorPrimary");
  console.log(`     → Primaire kleur: ${body.colorPrimary}`);
});

await test("PUT /api/admin/theme past kleur aan", async () => {
  const { status, body } = await fetch(`${BASE_URL}/api/admin/theme`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: COOKIE },
    body: JSON.stringify({ siteId, colorPrimary: "#ff6600" }),
  }).then(async (r) => ({ status: r.status, body: await r.json() }));
  if (status !== 200) throw new Error(`Status ${status}`);
  if (body.colorPrimary !== "#ff6600") throw new Error("Kleur niet aangepast");
  // Reset
  await fetch(`${BASE_URL}/api/admin/theme`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: COOKIE },
    body: JSON.stringify({ siteId, colorPrimary: "#b45309" }),
  });
});

// ── Blog ───────────────────────────────────────────────────────────────────
console.log("\n▶ Blog");
let blogPostId: string;

await test("GET /api/admin/blog?siteId=... geeft artikelen terug", async () => {
  const { status, body } = await get(`/api/admin/blog?siteId=${siteId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
  console.log(`     → ${body.length} artikel(en)`);
});

await test("POST /api/admin/blog maakt artikel aan", async () => {
  const { status, body } = await post("/api/admin/blog", { siteId, title: "Test artikel" });
  if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(body)}`);
  blogPostId = body.id;
  console.log(`     → Aangemaakt: ${body.title}`);
});

await test("PATCH /api/admin/blog/[id] publiceert artikel", async () => {
  const { status, body } = await patch(`/api/admin/blog/${blogPostId}`, { status: "published" });
  if (status !== 200) throw new Error(`Status ${status}`);
  if (body.status !== "published") throw new Error("Status niet gepubliceerd");
});

await test("DELETE /api/admin/blog/[id] verwijdert artikel", async () => {
  const { status } = await del(`/api/admin/blog/${blogPostId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
});

// ── Navigatie ──────────────────────────────────────────────────────────────
console.log("\n▶ Navigatie");
let navId: string;

await test("GET /api/admin/nav?siteId=... geeft nav terug", async () => {
  const { status, body } = await get(`/api/admin/nav?siteId=${siteId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
  console.log(`     → ${body.length} nav-item(s)`);
});

await test("POST /api/admin/nav voegt item toe", async () => {
  const { status, body } = await post("/api/admin/nav", { siteId, label: "Test", href: "/test", sortOrder: 99 });
  if (status !== 200) throw new Error(`Status ${status}`);
  navId = body.id;
});

await test("DELETE /api/admin/nav/[id] verwijdert nav-item", async () => {
  const { status } = await del(`/api/admin/nav/${navId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
});

// ── Berichten ──────────────────────────────────────────────────────────────
console.log("\n▶ Contactberichten");

await test("GET /api/admin/messages?siteId=... geeft berichten terug", async () => {
  const { status, body } = await get(`/api/admin/messages?siteId=${siteId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
  console.log(`     → ${body.length} bericht(en)`);
});

// ── Contact form ───────────────────────────────────────────────────────────
console.log("\n▶ Contactformulier (publiek)");

await test("POST /api/contact slaat bericht op", async () => {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      siteId,
      name: "Test Gebruiker",
      email: "test@test.nl",
      subject: "Automatische test",
      message: "Dit is een testbericht vanuit de API-test suite.",
    }),
  });
  const body = await res.json();
  if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(body)}`);
  if (!body.ok) throw new Error("Response.ok is niet true");
});

// ── Instellingen ───────────────────────────────────────────────────────────
console.log("\n▶ Instellingen");

await test("GET /api/admin/settings?siteId=... geeft instellingen terug", async () => {
  const { status, body } = await get(`/api/admin/settings?siteId=${siteId}`);
  if (status !== 200) throw new Error(`Status ${status}`);
});

await test("PUT /api/admin/settings past Plausible-domein aan", async () => {
  const res = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: COOKIE },
    body: JSON.stringify({ siteId, plausibleDomain: "schatgravenmetkinderen.nl" }),
  });
  const body = await res.json();
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
  if (body.plausibleDomain !== "schatgravenmetkinderen.nl") throw new Error("Plausible-domein niet opgeslagen");
});

// ── Test-site opruimen ────────────────────────────────────────────────────
// (Cleanup in de DB)

// ── Resultaat ────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
console.log(`✅ Geslaagd:  ${passed}`);
console.log(`❌ Mislukt:   ${failed}`);
console.log(`📊 Totaal:    ${passed + failed}`);

if (failed > 0) {
    process.exit(1);
  } else {
    console.log("\n🎉 Alle tests geslaagd!");
  }
}

runTests().catch((e) => { console.error(e); process.exit(1); });
