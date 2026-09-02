import type { MotelyItem } from "motely-wasm";
import { resolveJamlAssetUrl, type JamlAssetKey } from "../assets.js";
import { MOTELY_SPRITE_BY_TYPE } from "./motelySpriteLut.generated.js";

/** sheet 0=Jokers 1=Tarots 2=Decks — packed in the LUT, not a string. */
const SHEET_ASSET: readonly JamlAssetKey[] = ["jokers", "tarots", "deck"];
const SHEET_COLS = [10, 10, 13] as const;
const SHEET_ROWS = [16, 6, 4] as const;

export interface MotelySpriteCell {
  atlasPath: string;
  gridCol: number;
  gridRow: number;
  gridCols: number;
  gridRows: number;
}

export function unpackSpriteCell(packed: number): {
  sheet: number;
  x: number;
  y: number;
} {
  return { sheet: packed & 0xff, x: (packed >>> 8) & 0xff, y: (packed >>> 16) & 0xff };
}

/** O(1): MotelyItemType int → atlas cell. No name, no normalize. */
export function motelyItemTypeToSprite(type: number): MotelySpriteCell | null {
  const packed = MOTELY_SPRITE_BY_TYPE.get(type);
  if (packed === undefined) return null;
  const { sheet, x, y } = unpackSpriteCell(packed);
  const asset = SHEET_ASSET[sheet];
  if (!asset) return null;
  return {
    atlasPath: resolveJamlAssetUrl(asset),
    gridCol: x,
    gridRow: y,
    gridCols: SHEET_COLS[sheet] ?? 0,
    gridRows: SHEET_ROWS[sheet] ?? 0,
  };
}

export function motelyItemToSprite(item: MotelyItem | number): MotelySpriteCell | null {
  const type = typeof item === "number" ? item : item.type;
  return motelyItemTypeToSprite(type);
}
