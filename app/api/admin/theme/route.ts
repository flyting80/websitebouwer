import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteThemes } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Ongeldige kleurcode");

const themeSchema = z.object({
  siteId: z.string().uuid(),
  colorPrimary: hexColor.optional(),
  colorSecondary: hexColor.optional(),
  colorAccent: hexColor.optional(),
  colorBackground: hexColor.optional(),
  colorSurface: hexColor.optional(),
  colorText: hexColor.optional(),
  colorTextMuted: hexColor.optional(),
  fontHeading: z.string().max(100).optional(),
  fontBody: z.string().max(100).optional(),
  logoUrl: z.string().max(500).nullable().optional(),
  borderRadius: z.string().max(20).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const [theme] = await db.select().from(siteThemes).where(eq(siteThemes.siteId, siteId));
  if (!theme) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(theme);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = themeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { siteId, ...fields } = parsed.data;

  const [existing] = await db.select().from(siteThemes).where(eq(siteThemes.siteId, siteId));
  if (existing) {
    await db.update(siteThemes).set({ ...fields, updatedAt: new Date().toISOString() }).where(eq(siteThemes.siteId, siteId));
  } else {
    await db.insert(siteThemes).values({ siteId, ...fields });
  }
  const [updated] = await db.select().from(siteThemes).where(eq(siteThemes.siteId, siteId));
  return NextResponse.json(updated);
}
