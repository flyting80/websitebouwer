# Flow 05 — Contactformulier

## Titel

Bezoeker verstuurt contactbericht; site-eigenaar ontvangt e-mail.

## Trigger

Submit op contact-form block op live site.

## Verwachte uitkomst

Rij in `contact_submissions` + e-mail via Resend naar `site.contactEmail`.

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Form UI | `BlockRenderer.tsx` → `ContactFormRender` |
| 2 | POST | `/api/contact` |
| 3 | Rate limit | 5 requests / 10 min / IP (in-memory) |
| 4 | Zod validatie | siteId, name, email, subject, message |
| 5 | DB insert | `contact_submissions` |
| 6 | E-mail | Resend — HTML met `escapeHtml()` op alle user input |

## Beveiliging

- Geen auth vereist (publiek formulier)
- `siteId` moet UUID zijn en site moet bestaan
- XSS in e-mail geblokkeerd via HTML escaping

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Spam | Rate limiting |
| Geen e-mail als Resend niet geconfigureerd | Submission wordt wel opgeslagen in DB |
