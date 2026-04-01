/**
 * Motely item decoder.
 *
 * MotelyItem.Value is a packed integer. The MotelyItemType enum
 * uses packed integers where the top nibble encodes category:
 *   0x1000 = PlayingCard, 0x2000 = Spectral, 0x3000 = Tarot,
 *   0x4000 = Planet, 0x5000 = Joker, 0xF000 = Invalid
 */

import { Motely } from "motely-wasm";

// ─── Category from MotelyItemType integer ────────────────────────────────────

const CATEGORY_MASK = 0xf000;

const CATEGORY_TO_TYPE: Record<number, string> = {
  0x1000: "Playing Card",
  0x2000: "Spectral",
  0x3000: "Tarot",
  0x4000: "Planet",
  0x5000: "Joker",
};

// ─── Reverse lookup: MotelyItemType integer → string name ────────────────────

const _itemTypeToName = new Map<number, string>();

function ensureItemTypeMap() {
  if (_itemTypeToName.size > 0) return;
  const e = Motely.MotelyItemType as Record<string, unknown>;
  for (const [key, val] of Object.entries(e)) {
    if (typeof val === "number" && typeof key === "string" && !/^\d+$/.test(key)) {
      _itemTypeToName.set(val, key);
    }
  }
}

/** Get the enum key name for a MotelyItemType value. */
export function motelyItemTypeName(itemType: number): string {
  ensureItemTypeMap();
  return _itemTypeToName.get(itemType) ?? "Unknown";
}

/** Get the category string for a MotelyItemType value. */
export function motelyItemCategory(itemType: number): string {
  return CATEGORY_TO_TYPE[itemType & CATEGORY_MASK] ?? "Unknown";
}

/** Convert PascalCase enum key to display name. */
export function motelyItemDisplayName(itemType: number): string {
  const name = motelyItemTypeName(itemType);
  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

// ─── Module-level cache ──────────────────────────────────────────────────────

const _cache = new Map<number, string | null>();

/**
 * Decode a MotelyItemType integer to a display name for sprite lookup.
 * Cached per value.
 */
export function decodeMotelyItemName(itemType: number): string | null {
  if (_cache.has(itemType)) return _cache.get(itemType) ?? null;

  const category = motelyItemCategory(itemType);
  if (category === "Unknown") {
    _cache.set(itemType, null);
    return null;
  }

  const name = motelyItemDisplayName(itemType);
  _cache.set(itemType, name);
  return name;
}

/** Warm the cache for a batch of item type values. */
export function warmMotelyItemCache(itemTypes: readonly number[]): void {
  for (const t of itemTypes) decodeMotelyItemName(t);
}

/** Number of unique items decoded so far. */
export function motelyItemCacheSize(): number {
  return _cache.size;
}
