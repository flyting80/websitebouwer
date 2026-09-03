# Flow 01 — Admin login (wachtwoord)

## Titel

Beheerder logt in met e-mail en wachtwoord.

## Trigger

Gebruiker opent `/admin/login` en vult credentials in.

## Verwachte uitkomst

Geldige JWT-sessie (8 uur), redirect naar `/admin/sites`.

## Hoofdlijnen

1. Formulier POST naar NextAuth Credentials provider
2. Server vergelijkt met `ADMIN_EMAIL` + `ADMIN_PASSWORD` (env vars)
3. Bij succes: JWT-sessie cookie
4. Middleware laat `/admin/*` door

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Login form | `app/admin/login/page.tsx` |
| 2 | NextAuth handler | `app/api/auth/[...nextauth]/route.ts` |
| 3 | Auth config | `lib/auth.ts` — Credentials provider, JWT sessions |
| 4 | Middleware check | `middleware.ts` — redirect naar login als geen sessie |

## Omgevingsvariabelen

- `AUTH_SECRET` — sessie-encryptie (min. 32 tekens)
- `ADMIN_EMAIL` — enige admin-account
- `ADMIN_PASSWORD` — wachtwoord (alleen in env, nooit in git)
- `NEXTAUTH_URL` — basis-URL voor callback (exact productie-URL in prod)

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Zwak wachtwoord | Sterk wachtwoord in Vercel env vars |
| Verkeerde `NEXTAUTH_URL` | Exact productie-URL in Vercel |
| `ADMIN_PASSWORD` in git | Alleen Vercel / `.env.local`, nooit committen |
