# Deel 2 — Productie op saf4.nl

**Doel:** dezelfde Vercel-app koppelen aan het domein **saf4.nl**, e-mail en SEO correct instellen.

**Voorwaarde:** [Deel 1](./DEEL_1_VERCEL_SUPABASE.md) is succesvol afgerond (smoke test groen op `*.vercel.app`).

**Geschatte tijd:** 30–60 minuten (+ DNS propagatie tot 24 uur).

---

## Architectuur (productie)

```text
                    ┌─────────────────────────────────┐
                    │  saf4.nl / www.saf4.nl          │
                    │  (DNS → Vercel)                 │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │  Vercel (Next.js)               │
                    │  • /admin          beheer       │
                    │  • /{siteSlug}     klant-sites  │
                    │  • /api/*          backend      │
                    └───────┬─────────────┬───────────┘
                            │             │
              ┌─────────────▼──┐    ┌─────▼──────────┐
              │ Supabase       │    │ Resend         │
              │ • Postgres     │    │ noreply@saf4.nl│
              │ • Storage      │    └────────────────┘
              └────────────────┘
```

---

## Stap 1 — Domein toevoegen in Vercel

1. Vercel → jouw project → **Settings → Domains**
2. Voeg toe:
   - `saf4.nl`
   - `www.saf4.nl`
3. Vercel toont de benodigde DNS-records

---

## Stap 2 — DNS instellen (bij je .nl registrar)

Typische configuratie (exacte waarden volgen Vercel-dashboard):

| Record | Naam | Waarde | Doel |
|--------|------|--------|------|
| `A` | `@` | `76.76.21.21` | Apex → Vercel |
| `CNAME` | `www` | `cname.vercel-dns.com` | www → Vercel |

> Gebruik altijd de records die Vercel **live** toont — IP-adressen kunnen wijzigen.

Wacht tot Vercel **Valid Configuration** toont (enkele minuten tot 24 uur).

---

## Stap 3 — Environment variables bijwerken

Vercel → **Settings → Environment Variables → Production**

| Variabele | Oude waarde (deel 1) | Nieuwe waarde (deel 2) |
|-----------|----------------------|------------------------|
| `NEXTAUTH_URL` | `https://xxx.vercel.app` | `https://saf4.nl` |
| `NEXT_PUBLIC_SITE_URL` | `https://xxx.vercel.app` | `https://saf4.nl` |

Overige vars (`DATABASE_URL`, `AUTH_SECRET`, `STORAGE_*`, Resend) **ongewijzigd**.

**Redeploy** na wijziging (Deployments → … → Redeploy).

---

## Stap 4 — Resend: saf4.nl verifiëren

1. Resend → **Domains → Add Domain** → `saf4.nl`
2. Voeg DNS-records toe (SPF, DKIM — Resend toont ze)
3. Wacht op **Verified**
4. Update Vercel env:
   ```
   EMAIL_FROM=noreply@saf4.nl
   ```
5. Redeploy

Test: magic link + contactformulier moeten van `@saf4.nl` komen.

---

## Stap 5 — Site-instellingen in de admin

1. Login op `https://saf4.nl/admin`
2. Selecteer je site → **Instellingen**
3. Vul **Eigen domein** in: `saf4.nl`
4. Vul **Contact e-mail** in
5. Opslaan

Dit wordt gebruikt voor sitemap/canonical URLs en contactformulier-doorgifte.

---

## Stap 6 — URL-structuur op saf4.nl

| URL | Wat |
|-----|-----|
| `https://saf4.nl` | Redirect naar `/admin` (platform-root) |
| `https://saf4.nl/admin` | Beheeromgeving |
| `https://saf4.nl/{siteSlug}` | Live website van een klant/site |
| `https://saf4.nl/{siteSlug}/blog` | Blog (indien gebruikt) |
| `https://saf4.nl/{siteSlug}/sitemap.xml` | SEO sitemap |

### Bekende beperking (roadmap)

**Custom domain routing op root** is nog niet gebouwd. Dat betekent:

- `saf4.nl/mijn-slug` → werkt ✅
- `klantdomein.nl` → root toont nog niet automatisch die ene site ❌ (roadmap-item)

Voor één hoofdsite kun je de slug kort houden (bijv. `saf4.nl/home` of `saf4.nl/saf4`) tot root-routing klaar is.

---

## Stap 7 — Productie smoke test

| # | Test | URL |
|---|------|-----|
| 1 | HTTPS + certificaat | `https://saf4.nl` |
| 2 | Admin login | `https://saf4.nl/admin/login` |
| 3 | Magic link | Moet naar `saf4.nl` linken, niet vercel.app |
| 4 | Live site | `https://saf4.nl/{siteSlug}` |
| 5 | Sitemap | `https://saf4.nl/{siteSlug}/sitemap.xml` |
| 6 | Robots | `https://saf4.nl/{siteSlug}/robots.txt` |
| 7 | Media upload | Supabase URL laadt op saf4.nl |
| 8 | Contact + mail | E-mail van `noreply@saf4.nl` |

---

## Stap 8 — Optioneel: www redirect

In Vercel kun je instellen dat `www.saf4.nl` redirect naar `saf4.nl` (of omgekeerd). Kies één canonical variant en houd die consistent in `NEXT_PUBLIC_SITE_URL`.

---

## Rollback

Als iets misgaat:

1. `NEXTAUTH_URL` terug naar `https://xxx.vercel.app` → redeploy
2. Admin blijft bereikbaar via vercel.app-URL
3. DNS-wijzigingen zijn reversibel bij je registrar

---

## Volgende stappen (roadmap)

Zie [`ROADMAP.md`](../../ROADMAP.md):

- Custom domain routing (`klant.nl` → juiste site zonder slug)
- Blog block-editor in admin
- Multi-tenant site-eigenaarschap
