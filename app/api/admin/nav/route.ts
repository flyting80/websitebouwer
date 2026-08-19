import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { navItems } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/db/helpers";
import { z } from "zod";

// Block javascript: and data: hrefs to prevent XSS via nav links
const safeHref = z
  .string()
  .max(2000)
  .refine(
    (v) => !v.trim().toLowerCase().startsWith("javascript:") && !v.trim().toLowerCase().startsWith("data:"),
    { message: "Ongeldige href" }
  );

const navCreateSchema = z.object({
  siteId: z.string().uuid(),
  label: z.string().min(1).max(100),
  href: safeHref,
  sortOrder: z.number().optional(),
  openInNewTab: z.boolean().optional(),
  parentId: z.string().nullable().optional(),
  placement: z.enum(["header", "footer", "both"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const items = await db.select().from(navItems).where(eq(navItems.siteId, siteId)).orderBy(navItems.sortOrder);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = navCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const id = newId();
  await db.insert(navItems).values({
    id,
    siteId: parsed.data.siteId,
    label: parsed.data.label,
    href: parsed.data.href,
    sortOrder: parsed.data.sortOrder ?? 0,
    openInNewTab: parsed.data.openInNewTab ?? false,
    parentId: parsed.data.parentId ?? null,
    placement: parsed.data.placement ?? "header",
  });
  const [item] = await db.select().from(navItems).where(eq(navItems.id, id));
  return NextResponse.json(item);
}
