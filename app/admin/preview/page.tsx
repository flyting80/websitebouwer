"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DevicePreview } from "@/components/admin/DevicePreview";
import { useSiteStore } from "@/lib/stores/siteStore";

function PreviewInner() {
  const params = useSearchParams();
  const { currentSite } = useSiteStore();
  const path = params.get("path");
  const device = params.get("device") === "mobile" ? "mobile" : "desktop";
  const fallback = currentSite ? `/${currentSite.slug}/preview` : "/";
  const src = path && path.startsWith("/") ? path : fallback;

  return <DevicePreview src={src} initialDevice={device} />;
}

export default function AdminPreviewPage() {
  return (
    <Suspense fallback={<div className="text-stone-400 text-sm p-6">Laden...</div>}>
      <PreviewInner />
    </Suspense>
  );
}
