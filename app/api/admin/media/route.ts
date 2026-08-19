import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db";
import { auth } from "@/lib/auth";
import { and, desc, eq, isNull } from "drizzle-orm";
import { nanoid } from "@/lib/types/nanoid";
import { newId } from "@/lib/db/helpers";
import { uploadFile } from "@/lib/storage";

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_AUDIO = 32 * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg", "audio/webm"];

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId");
  const folderId = req.nextUrl.searchParams.get("folderId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });

  let files;
  if (folderId === "all") {
    files = await db.select().from(media).where(eq(media.siteId, siteId)).orderBy(desc(media.createdAt));
  } else if (!folderId || folderId === "root") {
    files = await db
      .select()
      .from(media)
      .where(and(eq(media.siteId, siteId), isNull(media.folderId)))
      .orderBy(desc(media.createdAt));
  } else {
    files = await db
      .select()
      .from(media)
      .where(and(eq(media.siteId, siteId), eq(media.folderId, folderId)))
      .orderBy(desc(media.createdAt));
  }
  return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const siteId = formData.get("siteId") as string;
  const folderIdRaw = formData.get("folderId") as string | null;

  if (!file || !siteId) return NextResponse.json({ error: "file and siteId required" }, { status: 400 });

  const isImage = IMAGE_TYPES.includes(file.type);
  const isAudio = AUDIO_TYPES.includes(file.type) || file.name.endsWith(".mp3") || file.name.endsWith(".m4a");
  if (!isImage && !isAudio) {
    return NextResponse.json({ error: "Alleen afbeeldingen of audiobestanden (MP3, M4A, WAV, OGG)" }, { status: 400 });
  }

  const maxSize = isAudio ? MAX_AUDIO : MAX_IMAGE;
  if (file.size > maxSize) {
    return NextResponse.json({ error: `Bestand te groot (max ${isAudio ? "32MB" : "8MB"})` }, { status: 400 });
  }

  const ext = ALLOWED_EXTENSIONS[file.type] ?? (isAudio ? "mp3" : "jpg");
  const filename = `${nanoid()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || (isAudio ? "audio/mpeg" : "image/jpeg");

  const { url, storageKey } = await uploadFile(siteId, filename, bytes, mimeType);

  const mediaId = newId();
  const folderId = folderIdRaw && folderIdRaw !== "root" ? folderIdRaw : null;

  await db.insert(media).values({
    id: mediaId,
    siteId,
    folderId,
    filename,
    originalName: file.name,
    url,
    mimeType,
    size: file.size,
    alt: file.name.replace(/\.[^.]+$/, ""),
    storageKey,
  });
  const [record] = await db.select().from(media).where(eq(media.id, mediaId));
  return NextResponse.json(record);
}
