"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Globe,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Mic2,
  MessageSquare,
  Settings,
  Palette,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useSiteStore } from "@/lib/stores/siteStore";
import { GlobalSiteLoader } from "./GlobalSiteLoader";

const navItems = [
  { label: "Pagina's", href: "/admin/pages", icon: FileText },
  { label: "Blog", href: "/admin/blog", icon: BookOpen },
  { label: "Podcast", href: "/admin/podcast", icon: Mic2 },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Berichten", href: "/admin/messages", icon: MessageSquare },
  { label: "Menubalk", href: "/admin/nav", icon: Menu },
  { label: "Preview", href: "/admin/preview", icon: Smartphone },
  { label: "Thema", href: "/admin/theme", icon: Palette },
  { label: "Instellingen", href: "/admin/settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentSite } = useSiteStore();

  const isLoginPage = pathname?.startsWith("/admin/login");
  if (isLoginPage) return <>{children}</>;
  

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <GlobalSiteLoader />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-amber-900 text-amber-50 z-30 flex flex-col transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-800">
          <span className="text-2xl font-bold font-serif">Saf4</span>
          <button
            className="ml-auto lg:hidden text-amber-200 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Site selector */}
        <div className="px-3 py-3 border-b border-amber-800" suppressHydrationWarning>
          <p className="text-amber-400 text-xs px-2 mb-1 uppercase tracking-wider font-medium">
            Actieve site
          </p>
          <Link
            href="/admin/sites"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-amber-800 transition-colors"
          >
            <Globe size={15} className="text-amber-300 shrink-0" />
            <span className="text-sm font-medium truncate" suppressHydrationWarning>
              {currentSite?.name ?? "Kies een site"}
            </span>
            <ChevronRight size={14} className="ml-auto text-amber-400" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname?.startsWith(href)
                  ? "bg-amber-700 text-white"
                  : "text-amber-100 hover:bg-amber-800"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-amber-800 space-y-1">
          <Link
            href="/admin/sites/new"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-100 hover:bg-amber-800 transition-colors"
          >
            <Plus size={16} />
            Nieuwe site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-100 hover:bg-amber-800 transition-colors"
          >
            <LogOut size={16} />
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-stone-200 flex items-center px-4 gap-3 shrink-0">
          <button
            className="lg:hidden text-stone-500 hover:text-stone-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="text-stone-700 text-sm font-medium" suppressHydrationWarning>
            {currentSite ? (
              <span suppressHydrationWarning>
                <span className="text-stone-400">{currentSite.name}</span>
                {pathname && (
                  <>
                    <span className="mx-1 text-stone-300">/</span>
                    <span>
                      {navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard"}
                    </span>
                  </>
                )}
              </span>
            ) : (
              "Saf4 — Website editor"
            )}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
