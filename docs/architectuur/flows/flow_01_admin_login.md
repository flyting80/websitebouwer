# Flow 01 — Admin login (magic link)

## Titel

Beheerder logt in via e-mail magic link.

## Trigger

Gebruiker opent `/admin/login` en vult e-mailadres in.

## Verwachte uitkomst

Geldige sessie (8 uur), redirect naar `/admin/sites`.

## Hoofdlijnen

1. Formulier POST naar NextAuth Resend provider
2. Resend stuurt magic link naar e-mail
3. Gebruiker klikt link → `/api/auth/callback/resend`
4. DrizzleAdapter maakt/update `users`, `sessions`, `verification_tokens`
5. Middleware laat `/admin/*` door

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Login form | `app/admin/login/page.tsx` |
| 2 | NextAuth handler | `app/api/auth/[...nextauth]/route.ts` |
| 3 | Auth config | `lib/auth.ts` — Resend provider, DrizzleAdapter |
| 4 | DB (prod) | Supabase: `users`, `sessions`, `verification_tokens` |
| 5 | Middleware check | `middleware.ts` — redirect naar login als geen sessie |

## Omgevingsvariabelen

- `AUTH_SECRET` — sessie-encryptie
- `AUTH_RESEND_KEY` — Resend voor magic link
- `EMAIL_FROM` — afzender (moet geverifieerd zijn bij Resend)
- `NEXTAUTH_URL` — basis-URL voor callback (exact: `https://jouwdomein.nl` in prod)

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Verkeerde `NEXTAUTH_URL` → link werkt niet | Exact productie-URL in Vercel |
| Resend domein niet geverifieerd | DNS SPF/DKIM (deel 2 deploy) |
| Zwak `AUTH_SECRET` | Runtime check blokkeert productie-start |

## Dev-only alternatief

`/api/dev-login` — alleen `NODE_ENV=development`, niet op Vercel productie.
