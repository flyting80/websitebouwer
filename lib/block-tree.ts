import type { Block, BlockType } from "@/lib/types/blocks";
import { createBlock } from "@/lib/types/blocks";
import { nanoid } from "@/lib/types/nanoid";

export function findBlockInTree(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockInTree(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findLocation(
  blocks: Block[],
  id: string,
  parentId: string | null = null
): { parentId: string | null; index: number } | null {
  const index = blocks.findIndex((b) => b.id === id);
  if (index >= 0) return { parentId, index };
  for (const block of blocks) {
    if (block.children) {
      const found = findLocation(block.children, id, block.id);
      if (found) return found;
    }
  }
  return null;
}

export function isDescendant(block: Block, id: string): boolean {
  if (block.id === id) return true;
  return (block.children ?? []).some((child) => isDescendant(child, id));
}

export function removeBlock(blocks: Block[], id: string): { tree: Block[]; removed: Block | null } {
  let removed: Block | null = null;

  function walk(list: Block[]): Block[] {
    const next: Block[] = [];
    for (const block of list) {
      if (block.id === id) {
        removed = block;
        continue;
      }
      if (block.children) {
        next.push({ ...block, children: walk(block.children) });
      } else {
        next.push(block);
      }
    }
    return next;
  }

  return { tree: walk(blocks), removed };
}

export function insertAt(
  blocks: Block[],
  parentId: string | null,
  index: number,
  block: Block
): Block[] {
  if (parentId === null) {
    const next = [...blocks];
    const i = Math.max(0, Math.min(index, next.length));
    next.splice(i, 0, block);
    return next;
  }

  return blocks.map((item) => {
    if (item.id === parentId) {
      const children = [...(item.children ?? [])];
      const i = Math.max(0, Math.min(index, children.length));
      children.splice(i, 0, block);
      return { ...item, children };
    }
    if (item.children) {
      return { ...item, children: insertAt(item.children, parentId, index, block) };
    }
    return item;
  });
}

export function moveTo(
  blocks: Block[],
  blockId: string,
  destParentId: string | null,
  destIndex: number
): Block[] {
  if (destParentId === blockId) return blocks;
  const moving = findBlockInTree(blocks, blockId);
  if (!moving) return blocks;
  if (destParentId && isDescendant(moving, destParentId)) return blocks;

  const from = findLocation(blocks, blockId);
  if (!from) return blocks;

  const { tree, removed } = removeBlock(blocks, blockId);
  if (!removed) return blocks;

  let index = destIndex;
  if (from.parentId === destParentId && from.index < destIndex) {
    index = destIndex - 1;
  }
  return insertAt(tree, destParentId, index, removed);
}

export function duplicateInTree(blocks: Block[], id: string): { tree: Block[]; clone: Block | null } {
  const loc = findLocation(blocks, id);
  const original = findBlockInTree(blocks, id);
  if (!loc || !original) return { tree: blocks, clone: null };
  const clone = JSON.parse(JSON.stringify(original)) as Block;
  clone.id = Math.random().toString(36).slice(2, 12);
  if (clone.children) retagIds(clone.children);
  return { tree: insertAt(blocks, loc.parentId, loc.index + 1, clone), clone };
}

function retagIds(blocks: Block[]) {
  for (const block of blocks) {
    block.id = Math.random().toString(36).slice(2, 12);
    if (block.children) retagIds(block.children);
  }
}

export function parseInsertId(overId: string): { parentId: string | null; index: number } | null {
  if (!overId.startsWith("insert:")) return null;
  const parts = overId.split(":");
  if (parts.length < 3) return null;
  const parentKey = parts[1];
  const index = Number(parts[2]);
  if (Number.isNaN(index)) return null;
  return { parentId: parentKey === "root" ? null : parentKey, index };
}

export function emptyColumnSection(): Block {
  const block = createBlock("section");
  block.props = { maxWidth: "full", paddingX: "none" };
  return block;
}

export function setColumnCount(block: Block, count: 2 | 3 | 4): Block {
  let children = [...(block.children ?? [])];
  while (children.length < count) children.push(emptyColumnSection());
  if (children.length > count) {
    const extra = children.slice(count);
    children = children.slice(0, count);
    const last = children[count - 1];
    const merged = [...(last.children ?? [])];
    for (const col of extra) merged.push(...(col.children ?? []));
    children[count - 1] = { ...last, children: merged };
  }
  return {
    ...block,
    props: { ...block.props, columns: count },
    children,
  } as Block;
}

export function applyDrop(blocks: Block[], activeId: string, overId: string): { tree: Block[]; selectedId?: string } {
  if (activeId === overId) return { tree: blocks };

  let dest = parseInsertId(overId);
  if (!dest && !overId.startsWith("palette:")) {
    const loc = findLocation(blocks, overId);
    if (loc) dest = { parentId: loc.parentId, index: loc.index + 1 };
  }
  if (!dest) return { tree: blocks };

  if (activeId.startsWith("palette:")) {
    const type = activeId.slice("palette:".length) as BlockType;
    const block = createBlock(type);
    return { tree: insertAt(blocks, dest.parentId, dest.index, block), selectedId: block.id };
  }

  return { tree: moveTo(blocks, activeId, dest.parentId, dest.index) };
}

export function cloneBlocksWithNewIds(blocks: Block[]): Block[] {
  function clone(block: Block): Block {
    const next = { ...block, id: nanoid() } as Block;
    if (block.children) next.children = block.children.map(clone);
    return next;
  }
  return blocks.map(clone);
}
