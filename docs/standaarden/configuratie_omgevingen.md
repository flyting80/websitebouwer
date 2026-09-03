# Configuratie per omgeving

Centrale inventaris van environment variables. **Geen echte secrets in dit document.**

## Matrix

| Variabele | Lokaal | Vercel preview | Productie | Geheim |
|-----------|--------|----------------|--------------|--------|
| `DATABASE_URL` | `local` | Supabase URI | Supabase URI | ✅ |
| `AUTH_SECRET` | dev string (≥32) | random hex | random hex | ✅ |
| `ADMIN_EMAIL` | `admin@voorbeeld.nl` | zelfde | zelfde | |
| `ADMIN_PASSWORD` | lokaal wachtwoord | sterk wachtwoord | sterk wachtwoord | ✅ |
| `NEXTAUTH_URL` | `http://localhost:3001` | `https://*.vercel.app` | `https://jouwdomein.nl` | |
| `NEXT_PUBLIC_SITE_URL` | — | `https://*.vercel.app` | `https://jouwdomein.nl` | |
| `STORAGE_PROVIDER` | — (local default) | `s3` | `s3` | |
| `STORAGE_ENDPOINT` | — | Supabase S3 URL | idem | |
| `STORAGE_REGION` | — | `eu-central-1` | idem | |
| `STORAGE_BUCKET` | — | `media` | idem | |
| `STORAGE_ACCESS_KEY_ID` | — | Supabase key | idem | ✅ |
| `STORAGE_SECRET_ACCESS_KEY` | — | Supabase secret | idem | ✅ |
| `STORAGE_PUBLIC_URL` | — | Supabase public URL | idem | |
| `ENABLE_DEV_LOGIN` | optioneel `true` | **niet zetten** | **niet zetten** | |

## Regels

1. Nieuwe env var → eerst `.env.example` + dit document updaten
2. Secrets alleen in Vercel / lokale `.env.local`, nooit in git
3. Na domeinwijziging: `NEXTAUTH_URL` + `NEXT_PUBLIC_SITE_URL` + redeploy
4. `AUTH_SECRET` in productie: min. 32 tekens, geen `dev-secret` substring

## Supabase connection string

- Gebruik **Transaction pooler** (poort 6543) voor Vercel/serverless
- Project Settings → Database → Connection string → URI

## Supabase Storage (S3)

- Endpoint: `https://[project-ref].supabase.co/storage/v1/s3`
- Public URL base: `https://[project-ref].supabase.co/storage/v1/object/public/media`
- Bucket `media` moet **public** zijn voor afbeeldingen op live sites

## Deploy-checklist koppeling

- Deel 1: [`docs/deploy/DEEL_1_VERCEL_SUPABASE.md`](../deploy/DEEL_1_VERCEL_SUPABASE.md)
- Deel 2: [`docs/deploy/DEEL_2_PRODUCTIEDOMEIN.md`](../deploy/DEEL_2_PRODUCTIEDOMEIN.md)
