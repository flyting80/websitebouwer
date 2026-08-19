import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { sites } from "@/lib/db";
import { eq } from "drizzle-orm";

function siteBaseUrl(siteSlug: string, domain?: string | null): string {
  if (domain) return `https://${domain}`;
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (base) return `${base.replace(/\/$/, "")}/${siteSlug}`;
  return `https://example.com/${siteSlug}`;
}

export default async function robots({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}): Promise<MetadataRoute.Robots> {
  const { siteSlug } = await params;
  const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug));
  const base = siteBaseUrl(siteSlug, site?.domain);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/preview/", "/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
