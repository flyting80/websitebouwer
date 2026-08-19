/**
 * Storage provider abstraction.
 *
 * Configure via environment variables:
 *
 * LOCAL (default — dev only):
 *   STORAGE_PROVIDER=local   (or leave unset)
 *   Files are written to public/uploads/{siteId}/{filename}
 *   Publicly reachable via /uploads/{siteId}/{filename}
 *
 * S3-COMPATIBLE (production — AWS S3, Cloudflare R2, Supabase Storage, MinIO, …):
 *   STORAGE_PROVIDER=s3
 *   STORAGE_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com   (omit for AWS S3)
 *   STORAGE_REGION=auto                                              (use "auto" for R2)
 *   STORAGE_BUCKET=my-bucket
 *   STORAGE_ACCESS_KEY_ID=xxx
 *   STORAGE_SECRET_ACCESS_KEY=xxx
 *   STORAGE_PUBLIC_URL=https://media.mijnsite.nl                     (CDN / public bucket URL)
 *
 * The returned `url` is always the public URL of the uploaded file.
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface UploadResult {
  url: string;
  storageKey: string; // e.g. "siteId/filename.jpg" — use to delete later
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
    // ignore — file may already be gone
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
    // Cloudflare R2 requires path-style URLs
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
  const bucket = process.env.STORAGE_BUCKET!;
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
  const bucket = process.env.STORAGE_BUCKET!;
  try {
    await getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function isCloudStorage(): boolean {
  return process.env.STORAGE_PROVIDER === "s3";
}

export async function uploadFile(
  siteId: string,
  filename: string,
  bytes: Buffer,
  mimeType: string,
): Promise<UploadResult> {
  if (isCloudStorage()) {
    return uploadS3(siteId, filename, bytes, mimeType);
  }
  return uploadLocal(siteId, filename, bytes);
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (isCloudStorage()) {
    return deleteS3(storageKey);
  }
  return deleteLocal(storageKey);
}
