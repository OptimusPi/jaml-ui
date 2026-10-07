/**
 * Engine vocabulary guard. Every name and key this package uses comes from the engine:
 * item names from motely-wasm's enums (src/engineVocab.ts) and filter keys from
 * src/lib/jaml/engineGrammar.generated.ts (generated from MotelyJAML's YAML loader by
 * scripts/gen-engine-grammar.mjs). This script proves both against the engine itself:
 *
 *   1. Every generated root, clause, clause-property and sources key is mapped by
 *      motely-wasm's JamlConfigLoader.check, and a made-up key is refused.
 *   2. The rarity bits partition the joker list: common + uncommon + rare + legendary.
 *   3. Decode enums round-trip name -> value -> name (a collision mislabels results).
 *
 * Run: pnpm vocab:check
 */
import * as Motely from "motely-wasm";

import { CLAUSE_KEYS, DISCRIMINATORS, ROOT_KEYS, SOURCE_KEYS } from "../src/lib/jaml/engineGrammar.generated.ts";

const problems = [];
const notes = [];

function runtimeEnum(kind) {
  const found = Motely[kind];
  return found !== null && typeof found === "object" ? found : undefined;
}

/** motely-wasm ships numeric enums — string keys are the names. */
function runtimeEnumNames(enumObject) {
  return Object.keys(enumObject).filter((key) => Number.isNaN(Number(key)));
}

// ── 1. The generated grammar is the engine loader's grammar ─────────────────
const boot = Motely.default;
if (boot.getStatus() !== boot.BootStatus.Booted) await boot.boot();
const UNMAPPED = /could not be mapped|no clause key among/i;
const check = (yaml) => Motely.JamlConfigLoader.check(yaml) ?? "";
const head = "deck: Red\nstake: White\nmust:\n";

if (!UNMAPPED.test(check(`${head}  - joker: Blueprint
    notAKey: 1
`))) {
  problems.push("JamlConfigLoader.check accepted a made-up key; the grammar probe cannot tell mapped from unmapped");
}
let keysChecked = 0;
const probe = (label, yaml) => {
  keysChecked += 1;
  const msg = check(yaml);
  if (UNMAPPED.test(msg)) problems.push(`${label}: ${msg}`);
};
for (const key of ROOT_KEYS) probe(`root.${key}`, `${key}: x
`);
for (const [disc, d] of Object.entries(DISCRIMINATORS)) {
  probe(disc, `${head}  - ${disc}: x
`);
  for (const key of CLAUSE_KEYS[d.clause]) {
    if (key !== d.valueProperty) probe(`${disc}.${key}`, `${head}  - ${disc}: x
    ${key}: x
`);
  }
}
for (const [where, keys] of Object.entries(SOURCE_KEYS)) {
  const [clause, block] = where.split(".");
  const disc = Object.keys(DISCRIMINATORS).find((k) => DISCRIMINATORS[k].clause === clause);
  for (const key of keys) probe(`${where}.${key}`, `${head}  - ${disc}: x
    ${block}:
      ${key}: x
`);
}
notes.push(`${keysChecked} grammar keys mapped by JamlConfigLoader.check`);

// ── 2. The rarity bits partition the joker list ─────────────────────────────
const itemTypeEnum = runtimeEnum("MotelyItemType");
const jokers = runtimeEnumNames(itemTypeEnum).filter((n) => (itemTypeEnum[n] & 0xf000) === Motely.MotelyItemTypeCategory.Joker);
const tiers = ["Common", "Uncommon", "Rare", "Legendary"].map((r) =>
  jokers.filter((n) => (itemTypeEnum[n] & 0x0c00) === Motely.MotelyJokerRarity[r]),
);
const tierTotal = tiers.reduce((sum, t) => sum + t.length, 0);
if (tierTotal !== jokers.length || tiers[3].length !== 5) {
  problems.push(`rarity tiers ${tiers.map((t) => t.length).join("/")} do not partition ${jokers.length} jokers into 5 legendaries`);
} else {
  notes.push(`joker tiers partition cleanly: ${tiers.map((t) => t.length).join(" + ")} = ${jokers.length}`);
}

// ── 3. Decode enums must round-trip: name -> value -> same name ─────────────
// These are the enums the UI reverse-looks-up to turn a packed search result
// into a display name. A collision (two names sharing one value) makes that
// lookup return whichever name was defined last, silently mislabelling the
// item — the failure this guard exists to prevent, in the one form that is
// actually detectable from here.
const DECODE_ENUMS = [
  "MotelyBossBlind",
  "MotelyTag",
  "MotelyVoucher",
  "MotelyDeck",
  "MotelyStake",
  "MotelyBoosterPack",
  "MotelyItemEdition",
  "MotelyItemSeal",
  "MotelyItemEnhancement",
];

let roundTripped = 0;
for (const kind of DECODE_ENUMS) {
  const runtime = runtimeEnum(kind);
  if (runtime === undefined) {
    problems.push(`${kind}: expected by the decode path but not exported by motely-wasm`);
    continue;
  }

  const byValue = new Map();
  const collisions = [];
  const broken = [];

  for (const name of runtimeEnumNames(runtime)) {
    const value = runtime[name];
    if (byValue.has(value)) {
      collisions.push(`${byValue.get(value)} and ${name} both = ${value}`);
      continue;
    }
    byValue.set(value, name);
    if (runtime[value] !== name) broken.push(`${name} -> ${value} -> ${runtime[value]}`);
  }

  if (collisions.length || broken.length) {
    problems.push(
      `${kind}: reverse lookup is not one-to-one\n` +
        (collisions.length ? `    collisions:  ${collisions.join("; ")}\n` : "") +
        (broken.length ? `    round-trip:  ${broken.join("; ")}\n` : ""),
    );
  } else {
    roundTripped += 1;
  }
}
notes.push(`${roundTripped}/${DECODE_ENUMS.length} decode enums round-trip name -> value -> name`);

const { MOTELY_SPRITE_BY_TYPE } = await import("../src/decode/motelySpriteLut.generated.ts");
const itemType = itemTypeEnum;
const itemTypeNames = runtimeEnumNames(itemType);
let lutHits = 0;
let lutUnknown = 0;
for (const [type] of MOTELY_SPRITE_BY_TYPE) {
  if (itemType[type] === undefined) lutUnknown += 1;
  else lutHits += 1;
}
if (lutUnknown) {
  problems.push(`sprite LUT has ${lutUnknown} keys not in MotelyItemType`);
}
if (MOTELY_SPRITE_BY_TYPE.size === 0) {
  problems.push("sprite LUT is empty — run pnpm lut:emit");
}
notes.push(
  `sprite LUT ${MOTELY_SPRITE_BY_TYPE.size} cells, ${lutHits} in MotelyItemType (${itemTypeNames.length} names)`,
);

// ── report ──────────────────────────────────────────────────────────────────
for (const note of notes) console.log(`  · ${note}`);

if (problems.length) {
  console.error(`\n✗ vocabulary drift detected (${problems.length}):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    "\nRegenerate the grammar (node scripts/gen-engine-grammar.mjs) against the MotelyJAML\n" +
      "build motely-wasm was published from.\n",
  );
  process.exit(1);
}

console.log(
  `\n✓ vocabulary in sync — ${keysChecked} grammar keys mapped, joker tiers partition, ` +
    `${roundTripped} decode enum(s) round-trip\n`,
);
