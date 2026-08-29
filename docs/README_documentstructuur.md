# README documentstructuur

## Doel

Centrale navigatie voor alle documentatie van de **Websitebeheertool** (`websitebpuwer`).  
Gestructureerd naar hetzelfde principe als het Escapegame-core project: scheiding tussen **architectuur**, **deploy**, **standaarden** en **roadmap**.

## Actieve mappen

| Map | Rol |
|-----|-----|
| [`deploy/`](./deploy/) | **Stap-voor-stap deployplannen** — Vercel + Supabase (deel 1), productiedomein (deel 2) |
| [`architectuur/`](./architectuur/) | Platformoverzicht, technologiekeuzes, flows |
| [`standaarden/`](./standaarden/) | Configuratie per omgeving, env vars |

## Kernbestanden (start hier)

| Bestand | Wanneer lezen |
|---------|---------------|
| [`deploy/DEEL_1_VERCEL_SUPABASE.md`](./deploy/DEEL_1_VERCEL_SUPABASE.md) | Eerste live test op `*.vercel.app` |
| [`deploy/DEEL_2_PRODUCTIEDOMEIN.md`](./deploy/DEEL_2_PRODUCTIEDOMEIN.md) | Productie op eigen domein |
| [`architectuur/platform_overzicht.md`](./architectuur/platform_overzicht.md) | Hoe admin, builder en live sites samenhangen |
| [`architectuur/technologie_keuzes.md`](./architectuur/technologie_keuzes.md) | Waarom Vercel, Supabase, Resend, … |
| [`architectuur/flows/README.md`](./architectuur/flows/README.md) | Index van alle runtime-flows |
| [`standaarden/configuratie_omgevingen.md`](./standaarden/configuratie_omgevingen.md) | Env vars per omgeving |
| [`../ROADMAP.md`](../ROADMAP.md) | Open punten en volgende stappen |

## Omgevingen

| Omgeving | URL (voorbeeld) | Database | Opslag |
|----------|-----------------|----------|--------|
| Lokaal | `http://localhost:3001` | SQLite (`local.db`) | `public/uploads/` |
| Preview (Vercel) | `https://websitebouwer.vercel.app` | Supabase Postgres | Supabase Storage |
| Productie | `https://jouwdomein.nl` | Supabase Postgres | Supabase Storage |

## Gerelateerde bestanden in de repo

- [`README.md`](../README.md) — projectintro + snelle start
- [`.env.example`](../.env.example) — alle env vars met uitleg
- [`AGENTS.md`](../AGENTS.md) — AI/agent regels voor Next.js
