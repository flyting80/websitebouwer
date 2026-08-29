# Websitebeheertool

Multi-site website builder: admin, block-editor, en gepubliceerde klant-sites vanuit één Next.js app.

> **Let op:** Saf4 (saf4.nl) is een **beheerde site** in deze tool — niet de naam van de beheerapplicatie zelf.

## Snel starten (lokaal)

```bash
npm install
cp .env.example .env.local   # DATABASE_URL=local voor SQLite
npm run dev                    # http://localhost:3001/admin
```

## Documentatie

| Onderwerp | Link |
|---------|------|
| **Deploy deel 1** (Vercel + Supabase) | [docs/deploy/DEEL_1_VERCEL_SUPABASE.md](./docs/deploy/DEEL_1_VERCEL_SUPABASE.md) |
| **Deploy deel 2** (eigen domein) | [docs/deploy/DEEL_2_PRODUCTIEDOMEIN.md](./docs/deploy/DEEL_2_PRODUCTIEDOMEIN.md) |
| Documentstructuur | [docs/README_documentstructuur.md](./docs/README_documentstructuur.md) |
| Platform & architectuur | [docs/architectuur/platform_overzicht.md](./docs/architectuur/platform_overzicht.md) |
| Technologiekeuzes | [docs/architectuur/technologie_keuzes.md](./docs/architectuur/technologie_keuzes.md) |
| Runtime flows | [docs/architectuur/flows/README.md](./docs/architectuur/flows/README.md) |
| Config per omgeving | [docs/standaarden/configuratie_omgevingen.md](./docs/standaarden/configuratie_omgevingen.md) |
| Roadmap | [ROADMAP.md](./ROADMAP.md) |

## Tech stack

Next.js 16 · Drizzle ORM · Supabase (Postgres + Storage) · NextAuth · Resend · Vercel · Tailwind v4

## Productie-architectuur

```text
GitHub → Vercel → Supabase (DB + Storage) + Resend (mail)
                      ↓
              jouw-domein.nl (DNS)
```

Zie [docs/architectuur/technologie_keuzes.md](./docs/architectuur/technologie_keuzes.md) voor rationale en alternatieven.

## Scripts

```bash
npm run dev          # Development server (poort 3001)
npm run build        # Productie build
npx drizzle-kit push # Schema naar DB (zet DATABASE_URL eerst)
npm run db:seed      # Demo data (alleen SQLite lokaal)
```

## Repository

- GitHub: `https://github.com/flyting80/websitebouwer`
- Productiedomein beheertool (voorbeeld): configureerbaar via Vercel Domains
