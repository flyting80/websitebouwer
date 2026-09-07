import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw =
    (process.env.DATABASE_URL ?? "").trim() ||
    (process.env.POSTGRES_PRISMA_URL ?? "").trim() ||
    (process.env.POSTGRES_URL ?? "").trim();
  const mode =
    !raw || raw === "local" || raw.startsWith("file:") ? "local" : "postgres";

  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    db: {
      mode,
      hasDatabaseUrl: Boolean((process.env.DATABASE_URL ?? "").trim()),
      hasPostgresUrl: Boolean((process.env.POSTGRES_URL ?? "").trim()),
      hasPostgresPrismaUrl: Boolean((process.env.POSTGRES_PRISMA_URL ?? "").trim()),
      looksLikePostgres: raw.startsWith("postgres://") || raw.startsWith("postgresql://"),
      isLocalLiteral: (process.env.DATABASE_URL ?? "").trim() === "local",
      length: raw.length,
      source: (process.env.DATABASE_URL ?? "").trim()
        ? "DATABASE_URL"
        : (process.env.POSTGRES_PRISMA_URL ?? "").trim()
          ? "POSTGRES_PRISMA_URL"
          : (process.env.POSTGRES_URL ?? "").trim()
            ? "POSTGRES_URL"
            : null,
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
    storage: {
      provider: process.env.STORAGE_PROVIDER || "auto",
      hasSupabaseUrl: Boolean(
        (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").trim()
      ),
      hasServiceRoleKey: Boolean(
        (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "").trim()
      ),
      bucket: (process.env.STORAGE_BUCKET ?? "media").trim() || "media",
      isS3: process.env.STORAGE_PROVIDER === "s3",
    },
  });
}
