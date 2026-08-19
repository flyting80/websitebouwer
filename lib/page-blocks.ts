import type { Block } from "@/lib/types/blocks";
import type { Page } from "@/lib/db";

export function parseBlocks(raw: unknown): Block[] {
  if (!raw) return [];
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(value) ? (value as Block[]) : [];
  } catch {
    return [];
  }
}

export function pageHasMobileLayout(blocks: Block[]) {
  return blocks.length > 0;
}

export function parsePageJsonFields<T extends Page>(page: T) {
  return {
    ...page,
    draftBlocks: parseBlocks(page.draftBlocks),
    liveBlocks: parseBlocks(page.liveBlocks),
    draftBlocksMobile: parseBlocks((page as T & { draftBlocksMobile?: unknown }).draftBlocksMobile),
    liveBlocksMobile: parseBlocks((page as T & { liveBlocksMobile?: unknown }).liveBlocksMobile),
  };
}
