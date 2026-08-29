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
 Supabase Postgres    Supabase Storage   Resend
 (DATABASE_URL)       (STORAGE_*=s3)     (login + contact)
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

## Stap 2 — Resend (e-mail)

1. Account op [resend.com](https://resend.com)
2. **API Keys → Create** → noteer `re_...`
3. Voor eerste test: gebruik Resend sandbox (alleen naar je eigen geverifieerde e-mail)
4. Later (deel 2): verifieer je verzenddomein voor productie-mails

---

## Stap 3 — Secrets genereren

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Bewaar als `AUTH_SECRET` (minimaal 32 tekens).

---

## Stap 4 — GitHub

Repo: `https://github.com/flyting80/websitebouwer`

```powershell
git add .
git commit -m "docs: deploy plan Vercel+Supabase en architectuurdocumentatie"
git push -u origin main
```

> Zorg dat `local.db`, `.env.local` en secrets **niet** gecommit zijn (staat in `.gitignore`).

---

## Stap 5 — Vercel project

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
| `AUTH_RESEND_KEY` | `re_...` | ✅ |
| `RESEND_API_KEY` | `re_...` (zelfde mag) | ✅ |
| `EMAIL_FROM` | `onboarding@resend.dev` (test) of later `noreply@jouwdomein.nl` | |
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

## Stap 6 — Eerste login en site

1. Open `https://jouw-project.vercel.app/admin/login`
2. Vul je e-mail in → open magic link
3. **Sites → Nieuwe site** (bijv. slug `demo`)
4. **Pagina's → Bewerken → Publiceren**
5. Bezoek `https://jouw-project.vercel.app/demo`

---

## Stap 7 — Smoke test checklist

| # | Test | Verwacht |
|---|------|----------|
| 1 | `/api/health` | `{ "ok": true }` |
| 2 | Magic link login | Redirect naar `/admin/sites` |
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
| Magic link werkt niet | Verkeerde `NEXTAUTH_URL` | Exact Vercel-URL, https, geen slash |
| Database error | Schema niet gepusht | `drizzle-kit push` met Supabase URL |
| Upload faalt | Storage keys / bucket | Check S3 keys + bucket `media` public |
| Lege homepage | Niet gepubliceerd | Opnieuw **Publiceren** in editor |
| Geen e-mail | Resend sandbox | Alleen naar geverifieerd adres sturen |

---

## Klaar voor deel 2?

Als de smoke test groen is → [`DEEL_2_PRODUCTIEDOMEIN.md`](./DEEL_2_PRODUCTIEDOMEIN.md)
