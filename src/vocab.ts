/**
 * Engine vocabulary — the ONE place item names enter this package.
 *
 * Everything here is derived from `jaml-lang`'s generated `Vocab`, which is
 * itself generated from the Motely engine's enums. Nothing in this file is
 * hand-listed, so it cannot drift from the engine on its own.
 *
 * What CAN drift is the seam between our two upstreams: `jaml-lang` ships the
 * *name lists* (strings, used for authoring/pickers/validation) while
 * `motely-wasm` ships the *runtime numeric enums* (used to decode packed values
 * coming back from a search). They are versioned independently, so nothing
 * forces them to describe the same engine build. `scripts/check-vocab-drift.mjs`
 * asserts they agree and runs in CI — that guard is the reason this module can
 * be trusted as the single source.
 *
 * Add a new vocabulary consumer? Import it from here, not from `jaml-lang`
 * directly, so the next fix only has to happen once.
 */
import { Vocab } from "jaml-lang";

/** Joker rarity as the engine models it. */
export type JokerRarityName = "Common" | "Uncommon" | "Rare" | "Legendary";

/**
 * Engine keys are PascalCase ids ("GreedyJoker"); sprite sheets use spaced
 * display names ("Greedy Joker"). Both collapse to lowercase-alphanumeric so
 * they can be compared.
 */
export const normalizeItemName = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Display names the engine spells differently. The engine writes "8 Ball" as
 * "EightBall", which no amount of normalizing will bridge (digit vs word).
 */
const DISPLAY_NAME_ALIASES: Record<string, string> = {
  "8 Ball": "EightBall",
};

/** Normalize a display name into its engine-comparable key. */
export const engineKey = (name: string): string =>
  normalizeItemName(DISPLAY_NAME_ALIASES[name] ?? name);

const keySet = (names: readonly string[]): ReadonlySet<string> =>
  new Set(names.map(normalizeItemName));

export const COMMON_JOKER_KEYS = keySet(Vocab.Enums.MotelyJokerCommon);
export const UNCOMMON_JOKER_KEYS = keySet(Vocab.Enums.MotelyJokerUncommon);
export const RARE_JOKER_KEYS = keySet(Vocab.Enums.MotelyJokerRare);

/**
 * Legendaries are the full joker set minus the three named tiers — the engine
 * ships no legendary-name enum. If a future engine adds a fifth rarity, those
 * jokers would silently land here; `check-vocab-drift.mjs` asserts the tier
 * counts still partition the full list so that shows up as a CI failure.
 */
export const LEGENDARY_JOKER_KEYS: ReadonlySet<string> = new Set(
  Vocab.Enums.MotelyJoker.map(normalizeItemName).filter(
    (key) =>
      !COMMON_JOKER_KEYS.has(key) &&
      !UNCOMMON_JOKER_KEYS.has(key) &&
      !RARE_JOKER_KEYS.has(key),
  ),
);

/** Rarity tier for a joker, by engine key or sprite display name. */
export function jokerRarityOf(name: string): JokerRarityName {
  const key = engineKey(name);
  if (LEGENDARY_JOKER_KEYS.has(key)) return "Legendary";
  if (RARE_JOKER_KEYS.has(key)) return "Rare";
  if (UNCOMMON_JOKER_KEYS.has(key)) return "Uncommon";
  return "Common";
}

/** True when the name is one of the engine's legendary jokers. */
export const isLegendaryJokerName = (name: string): boolean =>
  LEGENDARY_JOKER_KEYS.has(engineKey(name));

/** The JAML clause discriminator that scopes a search to this rarity. */
export function rarityClauseKey(rarity: JokerRarityName): string {
  switch (rarity) {
    case "Legendary":
      return "legendaryJoker";
    case "Rare":
      return "rareJoker";
    case "Uncommon":
      return "uncommonJoker";
    case "Common":
      return "commonJoker";
    default:
      return "commonJoker";
  }
}
