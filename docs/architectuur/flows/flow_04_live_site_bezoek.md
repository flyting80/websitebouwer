# Flow 04 — Live site bezoeken

## Titel

Bezoeker opent gepubliceerde website.

## Trigger

GET `/{siteSlug}` of `/{siteSlug}/{pageSlug}`.

## Verwachte uitkomst

HTML pagina met thema, navigatie, gepubliceerde blocks.

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Route | `app/(site)/[siteSlug]/page.tsx` of `[pageSlug]/page.tsx` |
| 2 | Site chrome laden | `lib/load-site-chrome.ts` — site, theme, nav, settings (parallel, cached) |
| 3 | Blocks parsen | `lib/page-blocks.ts` — JSON → Block[] |
| 4 | Responsive keuze | `components/site/ResponsivePageContent.tsx` — desktop vs mobile blocks |
| 5 | Layout | `components/site/SiteLayout.tsx` — header, footer, cookie banner |
| 6 | Block render | `BlockRenderer.tsx` — previewMode: `live` (echte md: breakpoints) |
| 7 | SEO metadata | `generateMetadata()` — title, description, canonical, Open Graph |

## SEO routes

- `/{siteSlug}/sitemap.xml` — `app/(site)/[siteSlug]/sitemap.ts`
- `/{siteSlug}/robots.txt` — `app/(site)/[siteSlug]/robots.ts`

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Site niet gevonden | `notFound()` |
| Pagina niet gepubliceerd | `notFound()` op `[pageSlug]`; lege blocks op home |
| DB fout | try/catch in loadSiteChrome → null → 404 |
