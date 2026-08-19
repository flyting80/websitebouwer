# Deploy documentatie

Deploy in **twee fasen**:

| Deel | Doel | Resultaat |
|------|------|-----------|
| [**Deel 1 — Vercel + Supabase**](./DEEL_1_VERCEL_SUPABASE.md) | Eerste live test | Admin + sites op `*.vercel.app` |
| [**Deel 2 — saf4.nl**](./DEEL_2_SAF4_NL.md) | Productie-domein | Zelfde stack op `https://saf4.nl` |

## Volgorde

```
Lokaal werken (SQLite)
       ↓
Deel 1: Supabase project + Vercel deploy + smoke test
       ↓
Deel 2: DNS saf4.nl → Vercel + env vars + e-mail domein
```

## Smoke test (na elke fase)

- [ ] `/api/health` → `{ "ok": true }`
- [ ] `/admin/login` → magic link ontvangen
- [ ] Site aanmaken + pagina publiceren
- [ ] `/{siteSlug}` toont live content
- [ ] Afbeelding uploaden → URL laadt
- [ ] Contactformulier → bericht in admin + e-mail
