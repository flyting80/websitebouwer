import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function siteBaseUrl(siteSlug: string, domain?: string | null): string {
  if (domain) return `https://${domain}`;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL;
  if (base) return `${base.replace(/\/$/, "")}/${siteSlug}`;
  return `https://example.com/${siteSlug}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;
  if (!siteSlug || siteSlug === "-") {
    return new NextResponse("Not found", { status: 404 });
  }

  const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug));
  const base = siteBaseUrl(siteSlug, site?.domain);

  const body = `User-agent: *
Allow: /
Disallow: /preview/
Disallow: /admin/

Sitemap: ${base}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
