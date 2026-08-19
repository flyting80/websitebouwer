export function resolveSiteHref(siteSlug: string, href: string) {
  if (href.startsWith("http") || href.startsWith("#")) return href;
  if (href === "/") return `/${siteSlug}`;
  if (href === "/activiteiten") return `/${siteSlug}/over-ons`;
  if (href === "/contact") return `/${siteSlug}#contact`;
  if (href.startsWith("/")) return `/${siteSlug}${href}`;
  return `/${siteSlug}/${href}`;
}

export function pageNavHref(page: { pageType?: string | null; slug?: string | null }) {
  if (page.pageType === "home" || !page.slug) return "/";
  return `/${page.slug}`;
}

export function normalizeNavHref(href: string) {
  if (!href) return "/";
  if (href.startsWith("http") || href.startsWith("#")) return href;
  const trimmed = href.replace(/\/+$/, "") || "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
