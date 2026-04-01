import {
  JOKERS, JOKER_FACES, TAROTS_AND_PLANETS, CONSUMABLE_FACES,
  VOUCHERS, BOSSES, TAGS, BOOSTER_PACKS,
  type SpriteEntry,
} from "./spriteData.js";

export interface SpritePos {
  x: number;
  y: number;
}

export type SpriteSheetType =
  | "Jokers" | "Tarots" | "Vouchers" | "Boosters"
  | "Enhancers" | "Editions" | "BlindChips" | "tags";

export interface SpriteData {
  pos: SpritePos;
  type: SpriteSheetType;
}

const ITEM_MAP = new Map<string, SpriteData>();

function addToMap(items: SpriteEntry[], type: SpriteSheetType) {
  for (const item of items) {
    if (!item.name || !item.pos) continue;
    const data: SpriteData = { pos: item.pos, type };
    ITEM_MAP.set(item.name, data);
    ITEM_MAP.set(item.name.toLowerCase(), data);
    ITEM_MAP.set(item.name.replace(/ /g, ""), data);
    ITEM_MAP.set(item.name.replace(/ /g, "").toLowerCase(), data);
  }
}

addToMap(JOKERS, "Jokers");
addToMap(JOKER_FACES, "Jokers");
addToMap(TAROTS_AND_PLANETS, "Tarots");
addToMap(CONSUMABLE_FACES ?? [], "Tarots");
addToMap(VOUCHERS, "Vouchers");
addToMap(BOSSES, "BlindChips");
addToMap(TAGS, "tags");
addToMap(BOOSTER_PACKS ?? [], "Boosters");

/** O(1) sprite lookup by name. Tries multiple normalizations. */
export function getSpriteData(name: string): SpriteData | null {
  const cleaned = name.replace(/^(Joker|Tarot|Planet|Voucher|Pack|Edition|Tag) [|:] /i, "").trim();

  if (ITEM_MAP.has(cleaned)) return ITEM_MAP.get(cleaned)!;
  if (ITEM_MAP.has(name)) return ITEM_MAP.get(name)!;

  const variants = [
    cleaned.toLowerCase(),
    cleaned.replace(/ /g, ""),
    cleaned.replace(/ /g, "").toLowerCase(),
    name.toLowerCase(),
    name.replace(/ /g, ""),
    name.replace(/ /g, "").toLowerCase(),
  ];

  for (const v of variants) {
    if (ITEM_MAP.has(v)) return ITEM_MAP.get(v)!;
  }

  return null;
}
