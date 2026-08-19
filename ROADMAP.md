# ROADMAP — Saf4 Website Builder

Laatste update: 2026-08-19

## Nu uitvoeren (deploy)

| # | Taak | Doc |
|---|------|-----|
| 1 | Deploy naar Vercel + Supabase | [`docs/deploy/DEEL_1_VERCEL_SUPABASE.md`](./docs/deploy/DEEL_1_VERCEL_SUPABASE.md) |
| 2 | Productie op saf4.nl | [`docs/deploy/DEEL_2_SAF4_NL.md`](./docs/deploy/DEEL_2_SAF4_NL.md) |

## Hoog — na eerste live test

| # | Taak | Waarom |
|---|------|--------|
| 3 | Custom domain root routing | `saf4.nl` of klantdomein zonder `/{slug}` |
| 4 | Site-eigenaarschap (user ↔ site) | Multi-tenant veiligheid |
| 5 | Blog block-editor in admin | Blog is nu half product |

## Midden

| # | Taak |
|---|------|
| 6 | Blog categorieën admin UI |
| 7 | CardGrid/Testimonial MediaPicker (ipv kale URL) |
| 8 | ISR/caching i.p.v. overal `force-dynamic` |
| 9 | Persistent rate limiting (Redis) voor contactformulier |
| 10 | Drizzle migraties committen (`drizzle/` map) |

## Laag / later

| # | Taak |
|---|------|
| 11 | Gebruikersbeheer UI (uitnodigen, rollen) |
| 12 | Webshop + Mollie (V2 in README) |
| 13 | Meertaligheid (hreflang) |

## Afgerond (recent)

- Security headers, middleware, DOMPurify, rate limiting contact
- Sitemap.xml + robots.txt per site
- Cloud storage abstractie (Supabase/R2/S3)
- Preview-mode voor editor desktop/mobiel consistentie
- Documentatie structuur (`docs/`)

## Documentatie

- Structuur: [`docs/README_documentstructuur.md`](./docs/README_documentstructuur.md)
- Architectuur: [`docs/architectuur/platform_overzicht.md`](./docs/architectuur/platform_overzicht.md)
- Flows: [`docs/architectuur/flows/README.md`](./docs/architectuur/flows/README.md)
