# Deel 1 — Deploy naar Vercel met Supabase

**Doel:** de builder live testen op een Vercel-preview-URL (`https://jouw-project.vercel.app`) met Supabase als database én bestandsopslag.

**Geschatte tijd:** 45–90 minuten (eenmalig).

---

## Architectuur (deel 1)

```text
GitHub (websitebouwer)
        │ push
        ▼
Vercel ─────────────────────────────────────┐
  • Next.js app (admin + live sites)        │
  • API routes (/api/*)                     │
  • Middleware (/admin bescherming)         │
        │                    │              │
        ▼                    ▼              ▼
 Supabase Postgres    Supabase Storage
```

**URLs na deploy:**

| Functie | URL |
|---------|-----|
| Admin | `https://jouw-project.vercel.app/admin` |
| Login | `https://jouw-project.vercel.app/admin/login` |
| Live site | `https://jouw-project.vercel.app/{siteSlug}` |
| Preview (concept) | `https://jouw-project.vercel.app/{siteSlug}/preview` |
| Health | `https://jouw-project.vercel.app/api/health` |
| Sitemap | `https://jouw-project.vercel.app/{siteSlug}/sitemap.xml` |

---

## Stap 1 — Supabase project aanmaken

1. Ga naar [supabase.com](https://supabase.com) → **New project**
2. Kies regio **EU (Frankfurt)** of dichtbij je gebruikers
3. Bewaar het **database wachtwoord** veilig

### 1a. Database connection string

Supabase → **Project Settings → Database → Connection string → URI**

Voorbeeld:
```text
postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Gebruik de **Transaction pooler** (poort 6543) voor serverless/Vercel.

### 1b. Schema naar Supabase pushen (lokaal, eenmalig)

```powershell
cd "C:\Users\flyti\OneDrive\Documenten\GitHub\websitebpuwer"
$env:DATABASE_URL="postgresql://..."   # jouw Supabase URI
npx drizzle-kit push
```

Controleer in Supabase → **Table Editor** dat tabellen bestaan (`sites`, `pages`, `users`, …).

### 1c. Supabase Storage bucket

1. Supabase → **Storage → New bucket**
2. Naam: `media`
3. **Public bucket:** aan (afbeeldingen moeten publiek bereikbaar zijn)
4. Optioneel: RLS policies — voor nu public read is voldoende; uploads gaan via de admin API (server-side).

### 1d. S3-compatibele keys voor de app

Supabase → **Project Settings → Storage → S3 Access Keys → Generate**

Noteer:
- Access Key ID
- Secret Access Key
- Endpoint (bijv. `https://abcdefgh.supabase.co/storage/v1/s3`)
- Region (bijv. `eu-central-1`)

Publieke URL-basis voor bestanden:
```text
https://[project-ref].supabase.co/storage/v1/object/public/media
```

---

## Stap 2 — Admin-account en secret

Kies een **e-mailadres en sterk wachtwoord** voor de enige beheerder.

Genereer daarna `AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Bewaar:
- `ADMIN_EMAIL` — jouw e-mail
- `ADMIN_PASSWORD` — sterk wachtwoord (min. 16 tekens)
- `AUTH_SECRET` — 64-char hex

---

## Stap 3 — GitHub

Repo: `https://github.com/flyting80/websitebouwer`

```powershell
git add .
git commit -m "docs: deploy plan Vercel+Supabase en architectuurdocumentatie"
git push -u origin main
```

> Zorg dat `local.db`, `.env.local` en secrets **niet** gecommit zijn (staat in `.gitignore`).

---

## Stap 4 — Vercel project

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import **websitebouwer** van GitHub
3. Framework: **Next.js** (auto-detect)
4. Root: project root
5. Build: `npm run build`

### Environment Variables (Production + Preview)

| Variabele | Waarde | Geheim |
|-----------|--------|--------|
| `DATABASE_URL` | Supabase Postgres URI (pooler) | ✅ |
| `AUTH_SECRET` | 64-char hex | ✅ |
| `ADMIN_EMAIL` | jouw admin e-mail | |
| `ADMIN_PASSWORD` | sterk wachtwoord | ✅ |
| `NEXTAUTH_URL` | `https://jouw-project.vercel.app` | |
| `NEXT_PUBLIC_SITE_URL` | `https://jouw-project.vercel.app` | |
| `STORAGE_PROVIDER` | `s3` | |
| `STORAGE_ENDPOINT` | `https://[ref].supabase.co/storage/v1/s3` | |
| `STORAGE_REGION` | `eu-central-1` | |
| `STORAGE_BUCKET` | `media` | |
| `STORAGE_ACCESS_KEY_ID` | Supabase S3 key | ✅ |
| `STORAGE_SECRET_ACCESS_KEY` | Supabase S3 secret | ✅ |
| `STORAGE_PUBLIC_URL` | `https://[ref].supabase.co/storage/v1/object/public/media` | |

**Niet instellen:** `ENABLE_DEV_LOGIN`, `DATABASE_URL=local`

6. **Deploy**

---

## Stap 5 — Eerste login en site

1. Open `https://jouw-project.vercel.app/admin/login`
2. Log in met `ADMIN_EMAIL` + `ADMIN_PASSWORD`
3. **Sites → Nieuwe site** (bijv. slug `demo`)
4. **Pagina's → Bewerken → Publiceren**
5. Bezoek `https://jouw-project.vercel.app/demo`

---

## Stap 6 — Smoke test checklist

| # | Test | Verwacht |
|---|------|----------|
| 1 | `/api/health` | `{ "ok": true }` |
| 2 | Wachtwoord-login | Redirect naar `/admin/sites` |
| 3 | Site + pagina publiceren | Live URL toont content |
| 4 | Media upload | Afbeelding zichtbaar (Supabase Storage URL) |
| 5 | Contactformulier | Bericht in `/admin/messages` |
| 6 | `/demo/sitemap.xml` | XML met URLs |
| 7 | Preview `/demo/preview` | Concept (login vereist) |

---

## Veelvoorkomende problemen

| Symptoom | Oorzaak | Oplossing |
|----------|---------|-----------|
| Build faalt op AUTH_SECRET | Te kort / dev-default | Nieuwe 64-char hex in Vercel |
| Login werkt niet | Verkeerde credentials of `NEXTAUTH_URL` | Check `ADMIN_EMAIL`/`ADMIN_PASSWORD`; exact Vercel-URL |
| Database error | Schema niet gepusht | `drizzle-kit push` met Supabase URL |
| Upload faalt | Storage keys / bucket | Check S3 keys + bucket `media` public |
| Lege homepage | Niet gepubliceerd | Opnieuw **Publiceren** in editor |

---

## Klaar voor deel 2?

Als de smoke test groen is → [`DEEL_2_PRODUCTIEDOMEIN.md`](./DEEL_2_PRODUCTIEDOMEIN.md)
