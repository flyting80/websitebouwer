import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions, sites } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { newId } from "@/lib/db/helpers";

// Simple in-memory rate limiter: max 5 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

const schema = z.object({
  siteId: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().max(300).optional(),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Te veel verzoeken, probeer het later opnieuw." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });

  const { siteId, name, email, subject, message } = parsed.data;

  const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
  if (!site) return NextResponse.json({ error: "Site niet gevonden" }, { status: 404 });

  await db.insert(contactSubmissions).values({
    id: newId(),
    siteId,
    name,
    email,
    subject,
    message,
  });

  return NextResponse.json({ ok: true });
}
