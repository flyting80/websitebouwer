import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const settingsSchema = z.object({
  siteId: z.string().uuid(),
  plausibleDomain: z.string().max(253).nullable().optional(),
  cookieBannerEnabled: z.boolean().optional(),
  footerText: z.string().max(500).nullable().optional(),
  socialFacebook: z.string().url().max(500).nullable().optional().or(z.literal("").transform(() => null)),
  socialInstagram: z.string().url().max(500).nullable().optional().or(z.literal("").transform(() => null)),
  socialLinkedin: z.string().url().max(500).nullable().optional().or(z.literal("").transform(() => null)),
  headerEnabled: z.boolean().optional(),
  headerSticky: z.boolean().optional(),
  headerDesktopLayout: z.string().max(100).nullable().optional(),
  headerMobileLayout: z.string().max(100).nullable().optional(),
  headerMobileStyle: z.enum(["drawer", "dropdown", "fullscreen"]).optional(),
  headerPosition: z.enum(["top", "below-hero"]).optional(),
  headerTagline: z.string().max(200).nullable().optional(),
  headerExtraImageUrl: z.string().max(500).nullable().optional(),
  headerStyle: z.string().max(100).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const [s] = await db.select().from(siteSettings).where(eq(siteSettings.siteId, siteId));
  return NextResponse.json(s ?? {});
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { siteId, ...fields } = parsed.data;
  const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.siteId, siteId));
  if (existing) {
    await db.update(siteSettings).set({ ...fields, updatedAt: new Date().toISOString() }).where(eq(siteSettings.siteId, siteId));
  } else {
    await db.insert(siteSettings).values({ siteId, ...fields });
  }
  const [updated] = await db.select().from(siteSettings).where(eq(siteSettings.siteId, siteId));
  return NextResponse.json(updated);
}
