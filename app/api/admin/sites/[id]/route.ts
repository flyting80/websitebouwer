import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [site] = await db.select().from(sites).where(eq(sites.id, id));
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(site);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name", "domain", "contactEmail"];
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const key of allowed) { if (key in body) update[key] = body[key]; }
  await db.update(sites).set(update).where(eq(sites.id, id));
  const [updated] = await db.select().from(sites).where(eq(sites.id, id));
  return NextResponse.json(updated);
}
