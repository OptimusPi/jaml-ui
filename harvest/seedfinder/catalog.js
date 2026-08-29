/**
 * Picker category metadata + the generated name catalogs (see
 * scripts/build-jaml-catalog.mjs). Kept separate from jaml-clauses.js so
 * this stays swappable without touching the text-editing logic.
 */
import catalogData from "./catalog.generated.json";

export const LEGENDARY_JOKER_NAMES = catalogData.legendaryJoker;

// The JOKER tile's item grid must include legendary jokers too — they're a
// picker-time detail (resolveClauseKind reclassifies them post-hoc), not a
// separate catalog. Sorted together so the grid doesn't clump them at the end.
const ALL_JOKER_NAMES = [...catalogData.joker, ...catalogData.legendaryJoker].sort();

// zone -> visual metadata for the Map Editor's rails + the Filter chips.
// Labels are player language ("what do I want in my run"), not JAML spec
// vocabulary — the raw must:/should:/mustNot: keys stay visible one tap
// away in the Map Editor's live code pane.
export const ZONES = {
  must: { label: "NEED", hint: "Every seed has all of these.", tone: "blue" },
  should: { label: "BONUS", hint: "Extra score per match — ranks the hits.", tone: "red" },
  mustNot: { label: "AVOID", hint: "Seed is rejected if any of these appear.", tone: "orange" },
};

// Picker's 7 category tiles. `kind` is the JAML clause discriminator these
// items commit as (except joker, which splits into legendaryJoker post-hoc —
// see resolveClauseKind below); `names` backs the item-grid step.
export const CATEGORIES = [
  { id: "joker", label: "JOKER", kind: "joker", names: ALL_JOKER_NAMES },
  { id: "tarotCard", label: "TAROT", kind: "tarotCard", names: catalogData.tarotCard },
  { id: "planetCard", label: "PLANET", kind: "planetCard", names: catalogData.planetCard },
  { id: "spectralCard", label: "SPECTRAL", kind: "spectralCard", names: catalogData.spectralCard },
  { id: "voucher", label: "VOUCHER", kind: "voucher", names: catalogData.voucher },
  { id: "tag", label: "TAG", kind: "tag", names: catalogData.tag },
  { id: "boss", label: "BOSS", kind: "boss", names: catalogData.boss },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

// A clause's catId (picker category) isn't always its stored clause `kind` —
// legendary jokers are picked from the JOKER tile but stored as
// `legendaryJoker`, and blind tags are picked from the TAG tile but stored
// as `smallBlindTag`/`bigBlindTag` depending on the settings-step toggle.
export function resolveClauseKind(catId, name, tagSlot) {
  if (catId === "joker" && LEGENDARY_JOKER_NAMES.includes(name)) return "legendaryJoker";
  if (catId === "tag") return tagSlot === "big" ? "bigBlindTag" : "smallBlindTag";
  return catId;
}

// Inverse of resolveClauseKind — given a stored clause kind, which picker
// tile does it reopen on (and, for tags, which slot was it)?
export function catIdForClauseKind(kind) {
  if (kind === "legendaryJoker") return "joker";
  if (kind === "smallBlindTag" || kind === "bigBlindTag") return "tag";
  return kind;
}
