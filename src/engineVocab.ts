// Item names straight from motely-wasm's own enums (generated/modules/index.g.mjs). Importing
// "motely-wasm" reads the constant tables only; it does not boot the WASM (measured 95 ms).
// MotelyItemType packs its category in bits 0xF000 (MotelyItemTypeCategory) and a joker's
// rarity in bits 0x0C00 (MotelyJokerRarity). Measured 2026-10-07: 150 jokers (61 common, 64
// uncommon, 20 rare, 5 legendary), 22 tarots, 18 spectrals, 12 planets.
import {
  MotelyBossBlind,
  MotelyDeck,
  MotelyItemEdition,
  MotelyItemEnhancement,
  MotelyItemSeal,
  MotelyItemType,
  MotelyItemTypeCategory,
  MotelyJokerRarity,
  MotelyStake,
  MotelyTag,
  MotelyVoucher,
} from "motely-wasm";

import { MOTELY_JOKER_STICKER } from "./lib/jaml/engineGrammar.generated.js";

type EnumTable = Record<string, string | number>;

const names = (e: EnumTable): string[] => Object.keys(e).filter((k) => typeof e[k] === "number");

const ITEM = MotelyItemType as unknown as EnumTable;
const CATEGORY = MotelyItemTypeCategory as unknown as Record<string, number>;
const RARITY = MotelyJokerRarity as unknown as Record<string, number>;

const ofCategory = (c: string): string[] => names(ITEM).filter((k) => ((ITEM[k] as number) & 0xf000) === CATEGORY[c]);
const JOKERS = ofCategory("Joker");
const ofRarity = (r: string): string[] => JOKERS.filter((k) => ((ITEM[k] as number) & 0x0c00) === RARITY[r]);

/** One table, keyed by the engine enum names, read by every consumer. */
export const ENGINE_ENUMS: Readonly<Record<string, readonly string[]>> = {
  MotelyJoker: JOKERS,
  MotelyJokerCommon: ofRarity("Common"),
  MotelyJokerUncommon: ofRarity("Uncommon"),
  MotelyJokerRare: ofRarity("Rare"),
  MotelyJokerLegendary: ofRarity("Legendary"),
  MotelyTarotCard: ofCategory("TarotCard"),
  MotelySpectralCard: ofCategory("SpectralCard"),
  MotelyPlanetCard: ofCategory("PlanetCard"),
  MotelyVoucher: names(MotelyVoucher as unknown as EnumTable),
  MotelyTag: names(MotelyTag as unknown as EnumTable),
  MotelyBossBlind: names(MotelyBossBlind as unknown as EnumTable),
  MotelyDeck: names(MotelyDeck as unknown as EnumTable),
  MotelyStake: names(MotelyStake as unknown as EnumTable),
  MotelyItemEdition: names(MotelyItemEdition as unknown as EnumTable),
  MotelyItemEnhancement: names(MotelyItemEnhancement as unknown as EnumTable),
  MotelyItemSeal: names(MotelyItemSeal as unknown as EnumTable),
  MotelyJokerSticker: MOTELY_JOKER_STICKER,
};
