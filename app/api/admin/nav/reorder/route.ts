import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { navItems } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const reorderSchema = z.object({
  siteId: z.string().uuid(),
  ids: z.array(z.string()).min(1).max(200),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { siteId, ids } = parsed.data;

  // Verify all navItem ids belong to the given siteId (prevents cross-site reorder)
  const existing = await db.select({ id: navItems.id }).from(navItems)
    .where(inArray(navItems.id, ids));
  const existingIds = new Set(existing.map((r: { id: string }) => r.id));

  // Fetch site ownership for the items we found
  const siteItems = await db.select({ id: navItems.id }).from(navItems)
    .where(eq(navItems.siteId, siteId));
  const allowedIds = new Set(siteItems.map((r: { id: string }) => r.id));

  for (const id of ids) {
    if (!existingIds.has(id) || !allowedIds.has(id)) {
      return NextResponse.json({ error: `Nav-item ${id} hoort niet bij deze site` }, { status: 403 });
    }
  }

  for (let i = 0; i < ids.length; i++) {
    await db.update(navItems).set({ sortOrder: i }).where(eq(navItems.id, ids[i]));
  }
  return NextResponse.json({ ok: true });
}
