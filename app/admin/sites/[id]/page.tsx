export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { sites } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SiteDashboard } from "@/components/admin/SiteDashboard";

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [site] = await db.select().from(sites).where(eq(sites.id, id));
  if (!site) notFound();
  return <SiteDashboard site={site} />;
}
