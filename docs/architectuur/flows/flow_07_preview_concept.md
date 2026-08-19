# Flow 07 — Preview concept

## Titel

Admin bekijkt ongepubliceerde pagina.

## Trigger

GET `/{siteSlug}/preview` of `/{siteSlug}/preview/{pageSlug}`.

## Verwachte uitkomst

Draft content zichtbaar voor ingelogde admin; niet indexeerbaar.

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Auth check | `auth()` — redirect naar `/admin/login` als geen sessie |
| 2 | Blocks | `draftBlocks` / `draftBlocksMobile` (niet live) |
| 3 | Layout | `SiteLayout` met `preview` prop (visuele indicator) |
| 4 | SEO | `metadata: { robots: { index: false } }` |

## Verschil met live

| | Preview | Live |
|---|---------|------|
| Auth | Vereist | Publiek |
| Blocks | draft | live |
| robots | noindex | index (via sitemap) |
