/**
 * Packed-int decoder guard.
 *
 * motely-wasm hands back items two ways: as MotelyItem objects (edition, seal,
 * enhancement, suit, rank already split out as enum values) and as the raw packed
 * `value` int. GameCard and every fixture that stores an item as a number go
 * through the packed-int path in src/decode/motelyItemDecoder.ts.
 *
 * The trap this guards: a motely-wasm enum member is its bit pattern *in place*
 * (MotelyItemEdition.Foil is 8_388_608 at runtime), but the generated .d.mts
 * declares the enums without values, so TypeScript believes Foil is 1. A decoder
 * that shifts the field down to an ordinal typechecks perfectly and returns
 * undefined for every edition, seal, enhancement and suit. Typecheck cannot catch
 * it; only running the decoder against the installed motely-wasm can.
 *
 * This builds packed ints the way the engine does — OR-ing the runtime enum
 * values together — and asserts the decoder reads every field back. It reads the
 * *built* entry (dist/motely.js), the same file `jaml-ui/motely` consumers load,
 * so it must run after `pnpm build`. CI does.
 *
 * It also proves the MotelyItemType display table (src/decode/motelyItemFormats.ts)
 * is derived from the runtime enums rather than hand-maintained: for every enum
 * member, the table must resolve the enum's own value, category and key, with the
 * display name coming from a registered alias or the prettified key — and nothing
 * outside the enum may appear in the table.
 *
 * Run: pnpm decode:check
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import {
  MotelyItemEdition as Edition,
  MotelyItemSeal as Seal,
  MotelyItemEnhancement as Enhancement,
  MotelyStandardcardSuit as Suit,
  MotelyStandardcardRank as Rank,
  MotelyItemType as ItemType,
  MotelyItemTypeCategory as Category,
} from "motely-wasm";

const here = dirname(fileURLToPath(import.meta.url));
const built = resolve(here, "../dist/motely.js");
if (!existsSync(built)) {
  console.error("decode:check: dist/motely.js is missing — run `pnpm build` first.");
  process.exit(2);
}
const { decodeMotelyItem } = await import(pathToFileURL(built).href);
// The build is unbundled (tsdown `unbundle`), so the formats table lives in its
// own chunk next to dist/motely.js — the same artifact deep importers load.
const builtFormats = resolve(here, "../dist/decode/motelyItemFormats.js");
if (!existsSync(builtFormats)) {
  console.error("decode:check: dist/decode/motelyItemFormats.js is missing — run `pnpm build` first.");
  process.exit(2);
}
const {
  MOTELY_ITEM_FORMATS_BY_VALUE: FORMATS_BY_VALUE,
  MOTELY_ITEM_FORMATS_BY_ENUM_NAME: FORMATS_BY_NAME,
  MOTELY_ITEM_DISPLAY_NAME_ALIASES: ALIASES,
} = await import(pathToFileURL(builtFormats).href);
if (!FORMATS_BY_VALUE || !ALIASES) {
  console.error("decode:check: built motelyItemFormats module is missing expected exports.");
  process.exit(2);
}

// Runtime sanity: if motely-wasm ever ships ordinal enums, every assumption below
// changes and the decoder must be revisited, not the test.
if (Edition.Foil === 1) {
  console.error("decode:check: MotelyItemEdition.Foil is 1 at runtime — motely-wasm enums are no longer bit-packed. Revisit motelyItemDecoder.ts.");
  process.exit(2);
}

// [label, packed value, fields the decoder must read back]
const cases = [
  ["Foil Joker#0", Category.Joker | Edition.Foil, { edition: "Foil", category: "joker" }],
  ["Holographic Joker#0", Category.Joker | Edition.Holographic, { edition: "Holographic" }],
  ["Polychrome Joker#0", Category.Joker | Edition.Polychrome, { edition: "Polychrome" }],
  ["Negative Joker#0", Category.Joker | Edition.Negative, { edition: "Negative" }],
  ["Base Joker#0 has no edition", Category.Joker, { edition: null, seal: null, enhancement: null }],
  ["Gold-seal Mult Ace of Spades", Category.Standardcard | Rank.Ace | Suit.Spades | Seal.Gold | Enhancement.Mult,
    { category: "playing", seal: "Gold", enhancement: "Mult", rank: "Ace", suit: "Spades" }],
  ["Purple-seal Glass 2 of Diamonds", Category.Standardcard | Rank.Two | Suit.Diamonds | Seal.Purple | Enhancement.Glass,
    { seal: "Purple", enhancement: "Glass", rank: "2", suit: "Diamonds" }],
  ["Red-seal Lucky King of Hearts", Category.Standardcard | Rank.King | Suit.Hearts | Seal.Red | Enhancement.Lucky,
    { seal: "Red", enhancement: "Lucky", rank: "King", suit: "Hearts" }],
  ["Blue-seal Steel 10 of Clubs", Category.Standardcard | Rank.Ten | Suit.Clubs | Seal.Blue | Enhancement.Steel,
    { seal: "Blue", enhancement: "Steel", rank: "10", suit: "Clubs" }],
  ["Eternal Polychrome Joker#0", (Category.Joker | Edition.Polychrome | (1 << 30)) >>> 0,
    { edition: "Polychrome", isEternal: true, isPerishable: false, isRental: false }],
  ["Rental Foil Joker#0", (Category.Joker | Edition.Foil | (1 << 29)) >>> 0, { edition: "Foil", isRental: true }],
  ["Perishable Joker#0 (bit 31 set)", (Category.Joker | (1 << 31)) >>> 0, { isPerishable: true, edition: null }],
  ["Tarot has no rank or suit", Category.TarotCard, { category: "tarot", rank: null, suit: null }],
];

// The object path must agree with the packed path for the same item.
const objectCases = cases.map(([label, packed, want]) => {
  const item = {
    value: packed,
    type: packed & 0xffff,
    typeCategory: packed & 0xf000,
    edition: packed & 0x7 << 23,
    seal: packed & 0x7 << 16,
    enhancement: packed & 0xf << 19,
    standardcardSuit: packed & 0x3 << 4,
    standardcardRank: packed & 0xf,
    isEternal: ((packed >>> 30) & 1) === 1,
    isPerishable: ((packed >>> 31) & 1) === 1,
    isRental: ((packed >>> 29) & 1) === 1,
  };
  return [`${label} (as MotelyItem object)`, item, want];
});

let failures = 0;
for (const [label, input, want] of [...cases, ...objectCases]) {
  const got = decodeMotelyItem(input);
  const wrong = Object.entries(want).filter(([field, expected]) => (got?.[field] ?? null) !== expected);
  if (wrong.length === 0) continue;
  failures += wrong.length;
  console.error(`FAIL ${label}` + (typeof input === "number" ? `  value=${input}` : ""));
  for (const [field, expected] of wrong) {
    console.error(`     ${field}: want ${JSON.stringify(expected)}, got ${JSON.stringify(got?.[field])}`);
  }
}

if (failures) {
  console.error(`\ndecode:check: ${failures} field(s) decoded wrong against motely-wasm ${Edition.Foil === 8388608 ? "(bit-packed enums)" : ""}`);
  process.exit(1);
}
console.log(`decode:check: ${cases.length} packed + ${objectCases.length} object cases decode correctly against installed motely-wasm.`);

// ── The formats table must be derived from the runtime enum, not hand-maintained ──
// src/decode/motelyItemFormats.ts used to hardcode every MotelyItemType value and
// category; nobody pinned it, so an engine rename/add silently mislabeled cards.
// The table is now built from the runtime enums at module load, with only display
// names as hand data. Prove it here, member by member: the value, category and
// enum name must come from the enum (a reintroduced hand-maintained value that
// disagrees fails here), the display name must be the prettified enum key or a
// registered alias, and no hand-added entry may exist outside the enum.
const spaceSplit = (value) =>
  value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
const enumNames = (enumObject) => Object.keys(enumObject).filter((key) => Number.isNaN(Number(key)));

// The by-name index is trimmed from dist while nothing imports it (true since
// before this check existed); pin it strictly whenever the artifact carries it.
const hasByName = FORMATS_BY_NAME != null;

let formatFailures = 0;
function formatFail(message) {
  formatFailures += 1;
  console.error(`FAIL formats: ${message}`);
}

for (const aliasName of Object.keys(ALIASES)) {
  if (typeof ItemType[aliasName] !== "number") {
    formatFail(`display-name alias "${aliasName}" is not a MotelyItemType member — the engine renamed or removed it`);
  }
}

const itemTypeNames = enumNames(ItemType);
for (const name of itemTypeNames) {
  const value = ItemType[name];
  const format = FORMATS_BY_VALUE[value];
  if (!format) {
    formatFail(`${name} (value ${value}) has no entry in MOTELY_ITEM_FORMATS_BY_VALUE`);
    continue;
  }
  if (format.value !== value) formatFail(`${name}: entry value ${format.value} != enum value ${value}`);
  if (format.enumName !== name) formatFail(`${name}: entry enumName ${JSON.stringify(format.enumName)} != enum key`);
  const categoryName = Category[value & 0xf000];
  if (format.category !== categoryName) {
    formatFail(`${name}: entry category ${JSON.stringify(format.category)} != MotelyItemTypeCategory[${value & 0xf000}] ${JSON.stringify(categoryName)}`);
  }
  if (hasByName && FORMATS_BY_NAME[name] !== format) formatFail(`${name}: MOTELY_ITEM_FORMATS_BY_ENUM_NAME does not resolve to the same entry`);
  const expectedDisplay = ALIASES[name] ?? spaceSplit(name);
  if (format.displayName !== expectedDisplay) {
    formatFail(`${name}: displayName ${JSON.stringify(format.displayName)} is neither the prettified enum key nor a registered alias (expected ${JSON.stringify(expectedDisplay)})`);
  }
}

// The reverse direction: nothing hand-added may disagree with the enum.
for (const [valueKey, format] of Object.entries(FORMATS_BY_VALUE)) {
  const value = Number(valueKey);
  if (ItemType[value] !== format.enumName) {
    formatFail(`MOTELY_ITEM_FORMATS_BY_VALUE[${valueKey}] = ${format?.enumName} is not MotelyItemType's member for that value (${ItemType[value]}) — hand-maintained drift`);
  }
}
if (hasByName) {
  for (const name of Object.keys(FORMATS_BY_NAME)) {
    if (typeof ItemType[name] !== "number") {
      formatFail(`MOTELY_ITEM_FORMATS_BY_ENUM_NAME has stale hand-maintained key "${name}"`);
    }
  }
}

if (formatFailures) {
  console.error(`\ndecode:check: ${formatFailures} format table drift(s) against motely-wasm`);
  process.exit(1);
}
console.log(`decode:check: ${itemTypeNames.length} MotelyItemType members resolve value/category/name from the runtime enum; display names are alias-or-key.`);
