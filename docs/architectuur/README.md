# Flows — Websitebeheertool

Runtime-flows voor admin, builder en publieke sites.  
Formaat gelijk aan Escapegame-core flowdocs: trigger → stappen → datapad → risico's.

## Index

| # | Flow | Trigger | Doc |
|---|------|---------|-----|
| 01 | Admin login (magic link) | Beheerder opent `/admin/login` | [flow_01](./flows/flow_01_admin_login.md) |
| 02 | Site aanmaken | Admin → Sites → Nieuw | [flow_02](./flows/flow_02_site_aanmaken.md) |
| 03 | Pagina bewerken & publiceren | Admin → Pagina editor | [flow_03](./flows/flow_03_pagina_bewerken_publiceren.md) |
| 04 | Live site bezoeken | Bezoeker opent `/{siteSlug}` | [flow_04](./flows/flow_04_live_site_bezoek.md) |
| 05 | Contactformulier | Bezoeker verstuurt formulier | [flow_05](./flows/flow_05_contactformulier.md) |
| 06 | Media upload | Admin uploadt bestand | [flow_06](./flows/flow_06_media_upload.md) |
| 07 | Preview concept | Admin bekijkt `/preview` | [flow_07](./flows/flow_07_preview_concept.md) |

## Leesvolgorde voor nieuwe ontwikkelaars

1. [`platform_overzicht.md`](../platform_overzicht.md)
2. Flow 01 (login) → Flow 02 (site) → Flow 03 (editor)
3. Flow 04 (live site) voor de publieke kant

## Gerelateerd

- Deploy: [`docs/deploy/README.md`](../../deploy/README.md)
- Config: [`docs/standaarden/configuratie_omgevingen.md`](../../standaarden/configuratie_omgevingen.md)
