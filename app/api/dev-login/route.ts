import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sessions, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// Only available in development mode — NEVER deploy with NODE_ENV=development in production
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }
  // Extra guard: if a real auth secret is configured, this route is too dangerous to keep enabled
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length > 10) {
    const isDev = process.env.ENABLE_DEV_LOGIN === "true";
    if (!isDev) {
      return NextResponse.json(
        { error: "Dev-login is disabled. Set ENABLE_DEV_LOGIN=true to enable in dev." },
        { status: 403 }
      );
    }
  }

  const db = getDb();

  const allUsers = await db.select().from(users).limit(1);
  if (!allUsers.length) {
    return new NextResponse("No users found. Run: npm run db:seed", { status: 404 });
  }
  const user = allUsers[0];

  const now = new Date().toISOString();
  const userSessions = await db.select().from(sessions).where(eq(sessions.userId, user.id));
  const validSession = userSessions.find((s: { expires: string }) => s.expires > now);

  if (!validSession) {
    return new NextResponse("No valid session. Run: npx tsx scripts/seed-demo.ts", { status: 404 });
  }

  const response = NextResponse.redirect(new URL("/admin/sites", req.url));
  response.cookies.set("authjs.session-token", validSession.sessionToken, {
    httpOnly: true,
    path: "/",
    expires: new Date(validSession.expires),
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
  });

  return response;
}
