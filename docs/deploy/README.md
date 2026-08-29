# Deploy documentatie

Deploy in **twee fasen**:

| Deel | Doel | Resultaat |
|------|------|-----------|
| [**Deel 1 — Vercel + Supabase**](./DEEL_1_VERCEL_SUPABASE.md) | Eerste live test | Websitebeheertool op `*.vercel.app` |
| [**Deel 2 — Productiedomein**](./DEEL_2_PRODUCTIEDOMEIN.md) | Eigen domein | Zelfde stack op jouw domein |

## Volgorde

```
Lokaal werken (SQLite)
       ↓
Deel 1: Supabase project + Vercel deploy + smoke test
       ↓
Deel 2: DNS + env vars + e-mail domein
```

## Smoke test (na elke fase)

- [ ] `/api/health` → `{ "ok": true }`
- [ ] `/admin/login` → magic link ontvangen
- [ ] Site aanmaken + pagina publiceren
- [ ] `/{siteSlug}` toont live content
- [ ] Afbeelding uploaden → URL laadt
- [ ] Contactformulier → bericht in admin + e-mail
