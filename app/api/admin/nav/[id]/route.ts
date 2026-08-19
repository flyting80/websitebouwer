import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { navItems } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

const SAFE_HREF_RE = /^(javascript:|data:)/i;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (typeof body.href === "string" && SAFE_HREF_RE.test(body.href.trim())) {
    return NextResponse.json({ error: "Ongeldige href" }, { status: 400 });
  }
  const allowed = ["label", "href", "sortOrder", "openInNewTab", "parentId", "placement", "visibility"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }
  if (Object.keys(update).length) {
    await db.update(navItems).set(update).where(eq(navItems.id, id));
  }
  const [updated] = await db.select().from(navItems).where(eq(navItems.id, id));
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(navItems).where(eq(navItems.id, id));
  return NextResponse.json({ ok: true });
}
