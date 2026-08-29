# Deel 2 — Productiedomein koppelen (Websitebeheertool)

**Doel:** de Vercel-app koppelen aan een **eigen domein** voor de beheertool, e-mail en SEO correct instellen.

**Voorwaarde:** [Deel 1](./DEEL_1_VERCEL_SUPABASE.md) is succesvol afgerond (smoke test groen op `*.vercel.app`).

**Geschatte tijd:** 30–60 minuten (+ DNS propagatie tot 24 uur).

> **Tool vs. beheerde site:** De **Websitebeheertool** is de admin-applicatie (`/admin`). Een site zoals **saf4.nl** is een **klant/site** die je in de tool aanmaakt en beheert — dat is niet de naam van de tool.

---

## Architectuur (productie)

```text
                    ┌─────────────────────────────────┐
                    │  jouwdomein.nl (of subdomein)   │
                    │  DNS → Vercel                   │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │  Websitebeheertool (Vercel)     │
                    │  • /admin          beheer       │
                    │  • /{siteSlug}     live sites   │
                    │  • /api/*          backend      │
                    └───────┬─────────────┬───────────┘
                            │             │
              ┌─────────────▼──┐    ┌─────▼──────────┐
              │ Supabase       │    │ Resend         │
              │ • Postgres     │    │ noreply@...    │
              │ • Storage      │    └────────────────┘
              └────────────────┘
```

**Voorbeeld:** tool op `https://beheer.jouwdomein.nl`, beheerde site saf4 op slug `saf4` → `https://beheer.jouwdomein.nl/saf4` (tot custom root-routing klaar is).

---

## Stap 1 — Domein toevoegen in Vercel

1. Vercel → jouw project → **Settings → Domains**
2. Voeg het domein toe waar de **beheertool** draait (bijv. `beheer.jouwdomein.nl` of `jouwdomein.nl`)
3. Vercel toont de benodigde DNS-records

---

## Stap 2 — DNS instellen (bij je registrar)

Typische configuratie (exacte waarden volgen Vercel-dashboard):

| Record | Naam | Waarde | Doel |
|--------|------|--------|------|
| `A` | `@` | `76.76.21.21` | Apex → Vercel |
| `CNAME` | `www` of `beheer` | `cname.vercel-dns.com` | Subdomein → Vercel |

> Gebruik altijd de records die Vercel **live** toont.

---

## Stap 3 — Environment variables bijwerken

| Variabele | Deel 1 | Deel 2 |
|-----------|--------|--------|
| `NEXTAUTH_URL` | `https://xxx.vercel.app` | `https://jouwdomein.nl` |
| `NEXT_PUBLIC_SITE_URL` | `https://xxx.vercel.app` | `https://jouwdomein.nl` |

**Redeploy** na wijziging.

---

## Stap 4 — Resend: verzenddomein verifiëren

1. Resend → **Domains → Add Domain** → het domein voor systeemmail (bijv. `jouwdomein.nl`)
2. DNS-records (SPF, DKIM) toevoegen
3. Vercel env: `EMAIL_FROM=noreply@jouwdomein.nl`
4. Redeploy

> Zakelijke mailboxen (`info@…`) regel je apart via Google Workspace / Microsoft 365. Resend is alleen voor login-mail en contactformulier vanuit de tool.

---

## Stap 5 — Beheerde site aanmaken (bijv. saf4)

1. Login op `https://jouwdomein.nl/admin`
2. **Sites → Nieuwe site** — naam "Saf4", slug `saf4`
3. **Instellingen** → vul **Eigen domein** in: `saf4.nl` (voor SEO/sitemap; root-routing volgt in roadmap)
4. Publiceer pagina's

De site **saf4.nl** is dan content die je beheert — niet de tool zelf.

---

## Stap 6 — URL-structuur

| URL | Wat |
|-----|-----|
| `https://jouwdomein.nl` | Redirect naar `/admin` |
| `https://jouwdomein.nl/admin` | Websitebeheertool |
| `https://jouwdomein.nl/saf4` | Live site Saf4 (voorbeeld) |
| `https://jouwdomein.nl/saf4/sitemap.xml` | SEO sitemap |

### Bekende beperking (roadmap)

**Custom domain root routing** — `saf4.nl` als root van de beheerde site (zonder slug) — volgt later. Zie [`ROADMAP.md`](../../ROADMAP.md).

---

## Stap 7 — Productie smoke test

| # | Test |
|---|------|
| 1 | HTTPS op beheertool-domein |
| 2 | `/admin/login` + magic link |
| 3 | Site aanmaken + publiceren |
| 4 | `/{siteSlug}` live |
| 5 | Media upload (Supabase) |
| 6 | Contactformulier + e-mail |

---

## Rollback

1. `NEXTAUTH_URL` terug naar `https://xxx.vercel.app` → redeploy
2. Admin blijft bereikbaar via vercel.app-URL
