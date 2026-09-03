import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: { user?: unknown } | null };
  const isAdminPath = nextUrl.pathname.startsWith("/admin");
  const isAdminApiPath = nextUrl.pathname.startsWith("/api/admin");
  const isAuthPath =
    nextUrl.pathname.startsWith("/admin/login") ||
    nextUrl.pathname.startsWith("/api/auth");

  if ((isAdminPath || isAdminApiPath) && !isAuthPath && !session?.user) {
    if (isAdminApiPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
