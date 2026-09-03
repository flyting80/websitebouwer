import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = (process.env.DATABASE_URL ?? "").trim();
  const mode =
    !raw || raw === "local" || raw.startsWith("file:") ? "local" : "postgres";

  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    db: {
      mode,
      // Never return the full URL — only safe diagnostics
      hasDatabaseUrl: Boolean(raw),
      looksLikePostgres: raw.startsWith("postgres://") || raw.startsWith("postgresql://"),
      isLocalLiteral: raw === "local",
      length: raw.length,
      // host hint without credentials
      hostHint: (() => {
        if (!raw.startsWith("postgres")) return null;
        try {
          const u = new URL(raw.replace(/^postgresql:/, "postgres:"));
          return u.hostname || null;
        } catch {
          return "unparseable";
        }
      })(),
    },
    auth: {
      hasAuthSecret: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
      hasAdminEmail: Boolean(process.env.ADMIN_EMAIL?.trim()),
      hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD?.trim()),
    },
  });
}
