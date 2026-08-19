# Flow 06 — Media upload

## Titel

Admin uploadt afbeelding of audio naar media-bibliotheek.

## Trigger

POST `/api/admin/media` (multipart form).

## Verwachte uitkomst

Bestand opgeslagen + rij in `media` met publieke URL.

## Gedetailleerde stappen

| # | Stap | Datapad |
|---|------|---------|
| 1 | Upload UI | `app/admin/media/page.tsx` |
| 2 | Auth check | `auth()` in route |
| 3 | Type/size check | IMAGE_TYPES, AUDIO_TYPES, max 8MB / 32MB |
| 4 | Extensie whitelist | Afgeleid van MIME type, niet van bestandsnaam |
| 5 | Storage | `lib/storage.ts` |
| 6a | Lokaal | `public/uploads/{siteId}/{filename}` |
| 6b | Productie | Supabase Storage via S3 API |
| 7 | DB insert | `media` — url, storageKey, mimeType, … |

## Verwijderen

DELETE `/api/admin/media/[id]` → `deleteFile(storageKey)` (lokaal of S3).

## Omgevingsvariabelen (productie)

```
STORAGE_PROVIDER=s3
STORAGE_ENDPOINT=https://[ref].supabase.co/storage/v1/s3
STORAGE_BUCKET=media
STORAGE_PUBLIC_URL=https://[ref].supabase.co/storage/v1/object/public/media
```

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Executable upload | MIME + extensie whitelist |
| Bestanden verdwijnen op Vercel | Verplicht cloud storage in prod |
