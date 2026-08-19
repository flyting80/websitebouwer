import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const msgs = await db.select().from(contactSubmissions)
    .where(eq(contactSubmissions.siteId, siteId))
    .orderBy(desc(contactSubmissions.createdAt));
  return NextResponse.json(msgs);
}
