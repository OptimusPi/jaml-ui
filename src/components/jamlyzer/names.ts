/**
 * Boss, voucher, tag and pack names use the matching sprite's name, so their
 * sprites can be looked up by name. Decks and stakes have no sprite name list.
 */

import {
  MotelyBoosterPack,
  MotelyBossBlind,
  MotelyTag,
  MotelyVoucher,
  MotelyDeck,
  MotelyStake,
} from "motely-wasm";
import { BOSSES, VOUCHERS, TAGS, BOOSTER_PACKS, type SpriteEntry } from "../../sprites/spriteData.js";

export function splitCamelCase(key: string): string {
  return key.replace(/([A-Z])/g, " $1").trim();
}

function alnum(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function spriteDisplayName(
  enumKey: string | undefined,
  sprites: SpriteEntry[],
  probe: (key: string) => string,
  fallback: (key: string) => string
): string {
  if (!enumKey) return "";
  const needle = alnum(probe(enumKey));
  const found = sprites.find((s) => alnum(s.name) === needle);
  return found ? found.name : fallback(enumKey);
}

export function bossDisplayName(boss: MotelyBossBlind): string {
  const key = MotelyBossBlind[boss];
  return spriteDisplayName(key, BOSSES, (k) => k, splitCamelCase) || "Small Blind";
}

export function voucherDisplayName(voucher: MotelyVoucher): string {
  return spriteDisplayName(MotelyVoucher[voucher], VOUCHERS, (k) => k, splitCamelCase);
}

export function tagDisplayName(tag: MotelyTag): string {
  return spriteDisplayName(MotelyTag[tag], TAGS, (k) => k, splitCamelCase);
}

export function packDisplayName(pack: MotelyBoosterPack): string {
  const key = MotelyBoosterPack[pack];
  return spriteDisplayName(key, BOOSTER_PACKS, (k) => k + "pack", (k) => `${splitCamelCase(k)} Pack`);
}

export function deckDisplayName(deck: MotelyDeck): string {
  return splitCamelCase(MotelyDeck[deck]);
}

export function stakeDisplayName(stake: MotelyStake): string {
  return splitCamelCase(MotelyStake[stake]);
}
