# Technologiekeuzes

Documentatie van **waarom** bepaalde diensten en patronen zijn gekozen, en wat de alternatieven zijn.

---

## Overzicht

| Onderdeel | Gekozen | Alternatieven | Waarom deze keuze |
|-----------|---------|---------------|-------------------|
| Framework | **Next.js 16** (App Router) | Remix, Nuxt | SSR + API routes + Vercel-first |
| Hosting | **Vercel** | Netlify, Fly.io, Railway | Native Next.js, serverless API, eenvoudig deploy |
| Database (prod) | **Supabase Postgres** | Neon, Railway Postgres | DB + Storage in één platform, EU-regio |
| Database (dev) | **SQLite** (`better-sqlite3`) | Supabase lokaal | Geen setup, snelle iteratie |
| ORM | **Drizzle** | Prisma | Lichtgewicht, dual schema (sqlite + pg) |
| Auth | **NextAuth v5** + magic link | Supabase Auth, Clerk | Past bij bestaande users/sessions tabellen |
| E-mail | **Resend** | SendGrid, Postmark | Eenvoudige API, magic link provider |
| Media opslag (prod) | **Supabase Storage** (S3 API) | Cloudflare R2, AWS S3 | Zelfde account als DB; app ondersteunt elke S3-provider |
| Media opslag (dev) | **Lokaal** (`public/uploads/`) | — | Geen cloud nodig tijdens ontwikkelen |
| Styling | **Tailwind CSS v4** | CSS modules | Snel prototypen, consistent thema |
| Drag & drop | **@dnd-kit** | react-beautiful-dnd | Actief onderhouden, toegankelijk |
| XSS-bescherming | **DOMPurify** (isomorphic) | — | Sanitiseert rich text vóór render |
| State (admin) | **Zustand** | Redux, Jotai | Lichtgewicht site-selector |

---

## Waarom Vercel en niet GitHub Pages?

GitHub Pages serveert alleen **statische bestanden**. Deze builder heeft nodig:

- Server-side API routes (`/api/admin/*`, `/api/contact`)
- NextAuth sessies en middleware
- Dynamische pagina's (`force-dynamic`)
- Database-connecties per request

→ **Vercel** is de minimale hostingkeuze voor dit projecttype.

---

## Waarom Supabase (database + storage)?

**Supabase** combineert:

1. **PostgreSQL** — vervangt SQLite op Vercel (geen persistent schijf)
2. **Storage** — S3-compatibel; de app gebruikt `@aws-sdk/client-s3` via `lib/storage.ts`
3. **EU-regio** — relevant voor AVG

**Neon + Cloudflare R2** is een equally valid alternatief; de app ondersteunt beide via `DATABASE_URL` en `STORAGE_*` env vars.

---

## Dual database schema

| Bestand | Gebruikt wanneer |
|---------|------------------|
| `lib/db/schema-sqlite.ts` | Lokaal (`DATABASE_URL=local`) |
| `lib/db/schema.ts` | Productie (Postgres connection string) |

`lib/db/index.ts` kiest automatisch op basis van `DATABASE_URL`.

---

## Beveiligingskeuzes (samenvatting)

| Maatregel | Implementatie |
|-----------|---------------|
| Admin afscherming | `middleware.ts` + per-route `auth()` |
| XSS | DOMPurify op `dangerouslySetInnerHTML` |
| HTML injection (mail) | `escapeHtml()` in contact API |
| Rate limiting | Contactformulier: 5 req / 10 min / IP |
| Security headers | CSP, HSTS, X-Frame-Options in `next.config.ts` |
| Input validatie | Zod op API-routes |
| Sessie | 8 uur maxAge |
| Secrets | AUTH_SECRET productie-check in `lib/auth.ts` |

Volledige security-audit: zie git history / eerdere scans in project.

---

## Bewuste beperkingen (open roadmap)

| Item | Status |
|------|--------|
| Custom domain root routing (`saf4.nl` = site zonder slug) | Open |
| Multi-tenant site-eigenaarschap (user ↔ site) | Open |
| Blog visuele block-editor | Open |
| Blog categorieën admin UI | Open |
| Gecachte pagina's (ISR) — nu `force-dynamic` | Open |

Zie [`ROADMAP.md`](../../ROADMAP.md).

---

## Env vars als single source of truth

Alle configuratie staat in:

- [`.env.example`](../../.env.example) — template
- [`standaarden/configuratie_omgevingen.md`](../standaarden/configuratie_omgevingen.md) — matrix per omgeving

Geen secrets in documentatie of git.
