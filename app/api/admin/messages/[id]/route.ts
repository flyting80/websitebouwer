import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const isRead = typeof body.isRead === "boolean" ? body.isRead : undefined;
  if (isRead === undefined) return NextResponse.json({ error: "isRead (boolean) required" }, { status: 400 });
  await db.update(contactSubmissions).set({ isRead }).where(eq(contactSubmissions.id, id));
  const [updated] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  return NextResponse.json({ ok: true });
}
