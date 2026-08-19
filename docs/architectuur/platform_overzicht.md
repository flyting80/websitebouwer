# Platformoverzicht — Saf4 Website Builder

## Wat is het?

Saf4 is een **multi-site website builder**: één installatie waarmee je meerdere losse websites beheert vanuit één admin-paneel. Elke site heeft eigen thema, pagina's, navigatie, blog, podcast en media.

## Drie lagen

```text
┌─────────────────────────────────────────────────────────────┐
│  LAAG 1 — Admin (beheer)                                    │
│  /admin/*                                                   │
│  Sites, pagina-editor, blog, podcast, media, instellingen   │
└────────────────────────────┬────────────────────────────────┘
                             │ API / database
┌────────────────────────────▼────────────────────────────────┐
│  LAAG 2 — Builder engine                                    │
│  BlockRenderer, PageEditor, PropertiesPanel, preview-mode   │
│  17 block-types, draft/live, desktop/mobiel apart           │
└────────────────────────────┬────────────────────────────────┘
                             │ publish
┌────────────────────────────▼────────────────────────────────┐
│  LAAG 3 — Gegenereerde sites (publiek)                      │
│  /{siteSlug}/*                                              │
│  Responsive HTML, SEO, contactformulier, sitemap            │
└─────────────────────────────────────────────────────────────┘
```

## Belangrijkste mappen in de codebase

| Pad | Rol |
|-----|-----|
| `app/admin/` | Admin UI (React client + server pages) |
| `app/(site)/[siteSlug]/` | Publieke site-routes |
| `app/api/admin/` | Beveiligde CRUD API |
| `app/api/contact/` | Publiek contactformulier |
| `components/editor/` | Block editor (canvas, palette, properties) |
| `components/site/` | Live site layout (header, footer, responsive) |
| `lib/db/` | Drizzle schema (SQLite lokaal, Postgres productie) |
| `lib/storage.ts` | Media: lokaal of S3-compatibel (Supabase/R2) |
| `lib/preview-mode.tsx` | Editor desktop/mobiel responsive simulatie |
| `middleware.ts` | Beschermt `/admin/*` en `/api/admin/*` |

## Data-model (kern)

```text
Site
 ├── Pages (draftBlocks / liveBlocks + mobile varianten)
 ├── SiteTheme (kleuren, fonts, logo)
 ├── SiteSettings (header, footer, analytics, domein)
 ├── NavItems (menu)
 ├── Media (+ folders)
 ├── BlogPosts
 ├── PodcastEpisodes
 └── ContactSubmissions
```

## Draft vs Live

| Status | Wie ziet het | Waar opgeslagen |
|--------|--------------|-----------------|
| Concept (draft) | Alleen ingelogde admin via `/preview` | `draftBlocks` |
| Gepubliceerd (live) | Alle bezoekers op `/{siteSlug}` | `liveBlocks` |

Publiceren kopieert draft → live (desktop én mobiel).

## Desktop vs Mobiel

De editor ondersteunt **aparte block-bomen** per device:

- Desktop: `draftBlocks` / `liveBlocks`
- Mobiel: `draftBlocksMobile` / `liveBlocksMobile`

Als mobiel leeg is, valt de live site terug op desktop-layout (responsive).

## Block-types (17)

heading, text, image, button, divider, spacer, hero, section, columns, gallery, contact-form, embed, card-grid, testimonial, faq, podcast, navbar

Zie [`flows/README.md`](./flows/README.md) voor runtime-gedrag per flow.

## Externe diensten

| Dienst | Rol | Lokaal | Productie |
|--------|-----|--------|-----------|
| SQLite / Supabase Postgres | Data | SQLite | Supabase |
| Local / Supabase Storage | Media | `public/uploads/` | Supabase bucket |
| Resend | E-mail | Optioneel | Verplicht |
| Vercel | Hosting | — | Ja |

Zie [`technologie_keuzes.md`](./technologie_keuzes.md) voor rationale.
