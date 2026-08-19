# Flow 02 — Site aanmaken

## Titel

Admin maakt een nieuwe website aan met defaults.

## Trigger

POST `/api/admin/sites` vanuit `/admin/sites/new`.

## Verwachte uitkomst

Nieuwe rij in `sites` + default theme, settings, home page, nav items.

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Formulier | `app/admin/sites/new/page.tsx` |
| 2 | API validatie | `app/api/admin/sites/route.ts` — Zod: name, slug, domain, contactEmail |
| 3 | Site insert | Tabel `sites` |
| 4 | Default theme | Tabel `site_themes` |
| 5 | Default settings | Tabel `site_settings` |
| 6 | Home page | Tabel `pages` — `pageType: home`, default hero block in `draftBlocks` |
| 7 | Nav items | Tabel `nav_items` — Home, Over ons, Contact |

## Live URL

Na publiceren van home: `/{siteSlug}` (bijv. `/schatgraven`).

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Duplicate slug | Unique constraint op `sites.slug` |
| Ongeldige slug | Regex `^[a-z0-9-]+$` in API |
