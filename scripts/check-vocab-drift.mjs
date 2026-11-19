/**
 * Engine vocabulary guard. Every key and name this package uses comes from the engine package:
 * motely-wasm/jaml/vocab.json (through src/lib/jaml/engineGrammar.ts and src/engineVocab.ts).
 * The engine's own tests write that file from its loader. This script proves the file that is
 * installed against the wasm binary that is installed beside it:
 *
 *   1. Every root key, clause key, clause member and nested member in vocab.json loads through
 *      the binary's JamlConfigLoader.check, and a made-up key is refused.
 *   2. Every enum in vocab.json that the binary also exports has the same names in the same
 *      order, and the rarity bits of MotelyItemType partition the jokers into vocab.json's
 *      four rarity lists.
 *   3. Decode enums round-trip name -> value -> name (a collision mislabels results).
 *
 * Run: pnpm vocab:check
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import * as Motely from "motely-wasm";

const vocab = JSON.parse(readFileSync(createRequire(import.meta.url).resolve("motely-wasm/jaml/vocab.json"), "utf8"));

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

// ── 1. vocab.json's keys are keys the binary's loader maps ──────────────────
// One value per member, built from what vocab.json says the member takes. The loader reads JSON
// as it reads YAML, so each probe is a JSON document.
const firstClauseKey = Object.keys(vocab.clauses)[0];
const objectOf = (type) =>
  Object.fromEntries(Object.entries(vocab.types[type]).filter(([, m]) => m.required).map(([key, m]) => [key, example(m)]));
function example(member) {
  switch (member.form) {
    case "Text": return "probe";
    case "Int": return 1;
    case "Bool": return true;
    case "Name":
    case "Names":
    case "CardSlot": return vocab.enums[member.enum][0];
    case "Ints":
    case "EventRolls": return [1];
    case "Texts": return ["AAAA1111"];
    case "Clauses": return [clauseOf(firstClauseKey)];
    case "Object": return objectOf(member.type);
    case "Objects": return [objectOf(member.type)];
    case "NoValue": return null;
    default:
      problems.push(`vocab.json names a form this script does not know: ${member.form}`);
      return null;
  }
}
const clauseOf = (key) => ({ [key]: example(vocab.types[vocab.clauses[key]][key]) });

const probes = [];
const probe = (label, doc) => probes.push({ label, text: JSON.stringify(doc) });

for (const [key, member] of Object.entries(vocab.root)) probe(`root.${key}`, { [key]: example(member) });
const probedTypes = new Set();
for (const [key, type] of Object.entries(vocab.clauses)) {
  probe(key, { must: [clauseOf(key)] });
  if (probedTypes.has(type)) continue; // a second key of the same clause shares its members
  probedTypes.add(type);
  for (const [memberKey, member] of Object.entries(vocab.types[type])) {
    if (memberKey === key) continue;
    probe(`${type}.${memberKey}`, { must: [{ ...clauseOf(key), [memberKey]: example(member) }] });
    if (!member.type || probedTypes.has(member.type)) continue;
    probedTypes.add(member.type);
    for (const [nestedKey, nested] of Object.entries(vocab.types[member.type])) {
      const mapping = { ...objectOf(member.type), [nestedKey]: example(nested) };
      probe(`${member.type}.${nestedKey}`, { must: [{ ...clauseOf(key), [memberKey]: member.form === "Objects" ? [mapping] : mapping }] });
    }
  }
}
for (const type of Object.keys(vocab.types))
  if (!probedTypes.has(type)) problems.push(`${type}: in vocab.json but no clause reaches it, so its keys were not checked`);

const boot = Motely.default;
if (boot.getStatus() !== boot.BootStatus.Booted) await boot.boot();
const verdict = (text) => {
  try {
    return Motely.JamlConfigLoader.check(text);
  } catch (thrown) {
    return `threw: ${thrown?.message ?? thrown}`;
  }
};
let keysChecked = 0;
for (const { label, text } of probes) {
  const refused = verdict(text);
  if (refused === null) keysChecked += 1;
  else problems.push(`${label}: vocab.json has this key but the installed engine refuses ${text}: ${refused}`);
}
if (verdict(JSON.stringify({ notAKey: 1 })) === null || verdict(JSON.stringify({ must: [{ ...clauseOf(firstClauseKey), notAKey: 1 }] })) === null)
  problems.push("JamlConfigLoader.check accepted a made-up key; the probe cannot tell mapped from unmapped");
notes.push(`${keysChecked} of ${probes.length} vocab.json keys mapped by the installed engine's JamlConfigLoader.check`);

// ── 2. vocab.json's names are the binary's names ────────────────────────────
let enumsSame = 0;
let enumsCompared = 0;
for (const [kind, listed] of Object.entries(vocab.enums)) {
  const runtime = runtimeEnum(kind);
  if (runtime === undefined) continue; // not every loader enum crosses into JS
  enumsCompared += 1;
  const names = runtimeEnumNames(runtime);
  if (names.length === listed.length && names.every((name, at) => name === listed[at])) enumsSame += 1;
  else problems.push(`${kind}: vocab.json lists ${listed.length} names, the binary exports ${names.length}, and they differ`);
}
notes.push(`${enumsSame}/${enumsCompared} enums in vocab.json match the binary's own, names and order`);

// The rarity bits partition the joker list, into the lists vocab.json gives.
const itemTypeEnum = runtimeEnum("MotelyItemType");
const jokers = runtimeEnumNames(itemTypeEnum).filter((n) => (itemTypeEnum[n] & 0xf000) === Motely.MotelyItemTypeCategory.Joker);
const tiers = ["Common", "Uncommon", "Rare", "Legendary"].map((r) =>
  jokers.filter((n) => (itemTypeEnum[n] & 0x0c00) === Motely.MotelyJokerRarity[r]),
);
const tierTotal = tiers.reduce((sum, t) => sum + t.length, 0);
const rarityLists = ["MotelyJokerCommon", "MotelyJokerUncommon", "MotelyJokerRare", "MotelyJokerLegendary"].map((kind) => vocab.enums[kind]);
const sameList = (a, b) => a.length === b.length && a.every((name, at) => name === b[at]);
if (tierTotal !== jokers.length || tiers[3].length !== 5) {
  problems.push(`rarity tiers ${tiers.map((t) => t.length).join("/")} do not partition ${jokers.length} jokers into 5 legendaries`);
} else if (!sameList(jokers, vocab.enums.MotelyJoker) || !tiers.every((tier, at) => sameList(tier, rarityLists[at]))) {
  problems.push("the binary's rarity bits and vocab.json's rarity lists name different jokers");
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
  console.error("\nvocab.json and the wasm binary ship in the same motely-wasm package: reinstall it, or report the mismatch to the engine.\n");
  process.exit(1);
}

console.log(
  `\n✓ vocabulary in sync — ${keysChecked} vocab.json keys mapped, ${enumsSame} enums match, joker tiers partition, ` +
    `${roundTripped} decode enum(s) round-trip\n`,
);
process.exit(0);
