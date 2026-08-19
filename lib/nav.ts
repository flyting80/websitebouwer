import type { NavItem } from "@/lib/db";

export type NavPlacement = "header" | "footer" | "both";

export function navPlacement(item: NavItem): NavPlacement {
  const value = (item as NavItem & { placement?: string }).placement;
  if (value === "header" || value === "footer" || value === "both") return value;
  return "both";
}

export function navParentId(item: NavItem): string | null {
  return (item as NavItem & { parentId?: string | null }).parentId ?? null;
}

export function inHeader(item: NavItem) {
  const p = navPlacement(item);
  return p === "header" || p === "both";
}

export function inFooter(item: NavItem) {
  const p = navPlacement(item);
  return p === "footer" || p === "both";
}

export type NavVisibility = "both" | "desktop" | "mobile";

export function navVisibility(item: NavItem): NavVisibility {
  const value = (item as NavItem & { visibility?: string }).visibility;
  if (value === "desktop" || value === "mobile" || value === "both") return value;
  return "both";
}

export function inHeaderDesktop(item: NavItem) {
  return inHeader(item) && (navVisibility(item) === "both" || navVisibility(item) === "desktop");
}

export function inHeaderMobile(item: NavItem) {
  return inHeader(item) && (navVisibility(item) === "both" || navVisibility(item) === "mobile");
}

export interface NavNode {
  item: NavItem;
  children: NavItem[];
}

export function navTree(items: NavItem[], predicate: (item: NavItem) => boolean): NavNode[] {
  const visible = items.filter(predicate);
  const tops = visible
    .filter((item) => !navParentId(item))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return tops.map((item) => ({
    item,
    children: visible
      .filter((child) => navParentId(child) === item.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

export function flattenNav(items: NavItem[]): NavItem[] {
  const tops = items
    .filter((item) => !navParentId(item))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const out: NavItem[] = [];
  for (const top of tops) {
    out.push(top);
    out.push(
      ...items
        .filter((child) => navParentId(child) === top.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }
  const orphans = items.filter((item) => !out.some((x) => x.id === item.id));
  return [...out, ...orphans];
}
