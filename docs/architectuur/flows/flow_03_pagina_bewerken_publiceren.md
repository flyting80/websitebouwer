# Flow 03 — Pagina bewerken & publiceren

## Titel

Admin bewerkt pagina in block-editor en publiceert naar live.

## Trigger

Admin opent `/admin/pages/[id]/edit`.

## Verwachte uitkomst

`liveBlocks` / `liveBlocksMobile` bijgewerkt; bezoekers zien nieuwe content op `/{siteSlug}` of `/{siteSlug}/{pageSlug}`.

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Editor laden | `components/editor/PageEditor.tsx` |
| 2 | Blocks renderen | `components/editor/EditorCanvas.tsx` → `BlockRenderer.tsx` |
| 3 | Block selectie / props | `components/editor/PropertiesPanel.tsx` |
| 4 | Auto-save (debounced) | PATCH `/api/admin/pages/[id]` — `draftBlocks` |
| 5 | Undo/redo | In-memory stack (max 50), per desktop/mobiel |
| 6 | Device toggle | `PreviewModeProvider` — simuleert mobiel/desktop breakpoints |
| 7 | Publiceren | POST `/api/admin/pages/[id]/publish` — kopieert draft → live |
| 8 | Live render | `app/(site)/[siteSlug]/page.tsx` — alleen `liveBlocks` als `isPublished` |

## Draft vs Live

```
draftBlocks  ──publish──►  liveBlocks
draftBlocksMobile  ──►  liveBlocksMobile
```

Bezoekers zien **nooit** draft content op live routes (fix: lege pagina als niet gepubliceerd).

## Preview

Ingelogde admin: `/{siteSlug}/preview` — toont `draftBlocks`, `robots: noindex`.

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Corrupt JSON in blocks | Null guards in BlockRenderer (gallery, faq, card-grid) |
| Editor crash op undo na view switch | undoRef/redoRef pattern in PageEditor |
