"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  siteId: string;
  siteSlug: string;
  enabled: boolean;
  primaryColor?: string;
}

export function CookieBanner({ siteId, siteSlug, enabled, primaryColor = "#d97706" }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = localStorage.getItem(`wb-cookies-${siteId}`);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [enabled, siteId]);

  function choose(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(`wb-cookies-${siteId}`, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] p-4">
      <div className="max-w-3xl mx-auto bg-white border border-stone-200 shadow-xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
        <p className="text-sm text-stone-600 flex-1">
          We gebruiken noodzakelijke cookies om de site te laten werken. Als je akkoord gaat, mogen we ook anonieme statistieken bijhouden.{" "}
          <Link href={`/${siteSlug}/cookies`} className="underline">
            Meer over cookies
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
          >
            Alleen noodzakelijk
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="px-3 py-2 text-sm rounded-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Akkoord
          </button>
        </div>
      </div>
    </div>
  );
}
