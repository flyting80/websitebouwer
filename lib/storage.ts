/**
 * Storage provider abstraction.
 *
 * LOCAL (dev only):
 *   STORAGE_PROVIDER=local   (or leave unset)
 *   Files → public/uploads/{siteId}/{filename}
 *
 * SUPABASE STORAGE (recommended on Vercel — no S3 keys needed):
 *   Uses NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 *   Optional: STORAGE_BUCKET=media (default)
 *   Optional: STORAGE_PROVIDER=supabase to force this mode
 *
 * S3-COMPATIBLE (AWS / R2 / Supabase S3 protocol):
 *   STORAGE_PROVIDER=s3
 *   STORAGE_ENDPOINT, STORAGE_REGION, STORAGE_BUCKET
 *   STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY
 *   STORAGE_PUBLIC_URL
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface UploadResult {
  url: string;
  storageKey: string;
}

function supabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ""
  ).replace(/\/$/, "");
}

function supabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

function storageBucket(): string {
  return (process.env.STORAGE_BUCKET ?? "media").trim() || "media";
}

export function canUseSupabaseStorage(): boolean {
  return Boolean(supabaseUrl() && supabaseServiceKey());
}

export function isS3Storage(): boolean {
  return process.env.STORAGE_PROVIDER === "s3";
}

export function isCloudStorage(): boolean {
  if (process.env.STORAGE_PROVIDER === "local") return false;
  if (isS3Storage()) return true;
  if (process.env.STORAGE_PROVIDER === "supabase") return canUseSupabaseStorage();
  // Auto-enable Supabase when credentials exist (typical Vercel↔Supabase integration)
  return canUseSupabaseStorage();
}

// ─── Local ───────────────────────────────────────────────────────────────────

async function uploadLocal(
  siteId: string,
  filename: string,
  bytes: Buffer,
): Promise<UploadResult> {
  const uploadDir = join(process.cwd(), "public", "uploads", siteId);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), bytes);
  return {
    url: `/uploads/${siteId}/${filename}`,
    storageKey: `${siteId}/${filename}`,
  };
}

async function deleteLocal(storageKey: string): Promise<void> {
  const { unlink } = await import("fs/promises");
  try {
    await unlink(join(process.cwd(), "public", "uploads", storageKey));
  } catch {
    // ignore
  }
}

// ─── Supabase Storage (REST) ─────────────────────────────────────────────────

async function uploadSupabase(
  siteId: string,
  filename: string,
  bytes: Buffer,
  mimeType: string,
): Promise<UploadResult> {
  const base = supabaseUrl();
  const key = supabaseServiceKey();
  const bucket = storageBucket();
  const storageKey = `${siteId}/${filename}`;

  const res = await fetch(`${base}/storage/v1/object/${bucket}/${storageKey}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": mimeType,
      "x-upsert": "true",
      "cache-control": "public, max-age=31536000, immutable",
    },
    body: new Uint8Array(bytes),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Supabase Storage upload mislukt (${res.status}): ${detail || res.statusText}`
    );
  }

  const publicBase =
    (process.env.STORAGE_PUBLIC_URL ?? "").replace(/\/$/, "") ||
    `${base}/storage/v1/object/public/${bucket}`;

  return {
    url: `${publicBase}/${storageKey}`,
    storageKey,
  };
}

async function deleteSupabase(storageKey: string): Promise<void> {
  const base = supabaseUrl();
  const key = supabaseServiceKey();
  const bucket = storageBucket();
  try {
    await fetch(`${base}/storage/v1/object/${bucket}/${storageKey}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
    });
  } catch {
    // ignore
  }
}

// ─── S3-compatible ────────────────────────────────────────────────────────────

function getS3Client() {
  const { S3Client } = require("@aws-sdk/client-s3");
  return new S3Client({
    region: process.env.STORAGE_REGION ?? "auto",
    endpoint: process.env.STORAGE_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: !!process.env.STORAGE_ENDPOINT,
  });
}

async function uploadS3(
  siteId: string,
  filename: string,
  bytes: Buffer,
  mimeType: string,
): Promise<UploadResult> {
  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  const bucket = storageBucket();
  const storageKey = `${siteId}/${filename}`;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: bytes,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const publicBase = (process.env.STORAGE_PUBLIC_URL ?? "").replace(/\/$/, "");
  const url = publicBase
    ? `${publicBase}/${storageKey}`
    : `https://${bucket}.s3.${process.env.STORAGE_REGION ?? "us-east-1"}.amazonaws.com/${storageKey}`;

  return { url, storageKey };
}

async function deleteS3(storageKey: string): Promise<void> {
  const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
  const bucket = storageBucket();
  try {
    await getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function uploadFile(
  siteId: string,
  filename: string,
  bytes: Buffer,
  mimeType: string,
): Promise<UploadResult> {
  if (isS3Storage()) {
    return uploadS3(siteId, filename, bytes, mimeType);
  }
  if (canUseSupabaseStorage()) {
    return uploadSupabase(siteId, filename, bytes, mimeType);
  }
  if (process.env.VERCEL) {
    throw new Error(
      "Media-upload vereist Supabase Storage. Zet in Vercel: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY (Project Settings → API → service_role). Bucket 'media' moet bestaan."
    );
  }
  return uploadLocal(siteId, filename, bytes);
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (isS3Storage()) {
    return deleteS3(storageKey);
  }
  if (canUseSupabaseStorage()) {
    return deleteSupabase(storageKey);
  }
  return deleteLocal(storageKey);
}
