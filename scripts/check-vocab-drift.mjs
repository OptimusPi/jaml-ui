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
 * motely-wasm 30 changed check()'s contract: valid YAML returns null, invalid YAML THROWS
 * a .NET exception (no message survives the boundary), and the throw poisons the runtime —
 * the next wasm call aborts the process ("attempted to call a UnmanagedCallersOnly method
 * from managed code"). A long-lived probe loop is also unstable: once enough garbage
 * accumulates, a GC finalizer calls back into the wasm and the process dies mid-run. So
 * every probe below is valid YAML (a mapped key loads: null; a drifted key throws), the
 * probes run in batches of child processes, and a throwing batch abandons only its own
 * process — the parent keeps probing and reports every drifted key it found.
 *
 * Run: pnpm vocab:check
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import * as Motely from "motely-wasm";

import { CLAUSE_KEYS, DISCRIMINATORS, MOTELY_JOKER_STICKER, ROOT_KEYS, SOURCE_KEYS } from "../src/lib/jaml/engineGrammar.generated.ts";

// ── child mode: run the probes sent as JSON on stdin, report JSON on stdout ──
// Kept at the top so the parent never boots the wasm for its own bookkeeping.
if (process.argv.includes("--probes")) {
  const probes = JSON.parse(await new Promise((resolve) => {
    let text = "";
    process.stdin.on("data", (chunk) => (text += chunk));
    process.stdin.on("end", () => resolve(text));
  }));
  const boot = Motely.default;
  if (boot.getStatus() !== boot.BootStatus.Booted) await boot.boot();
  const results = [];
  for (const { label, yaml } of probes) {
    try {
      results.push({ label, result: Motely.JamlConfigLoader.check(yaml) });
    } catch {
      // The runtime is poisoned by a throw: report and stop, the parent probes on.
      results.push({ label, threw: true });
      break;
    }
  }
  process.stdout.write(JSON.stringify(results));
  process.exit(0);
}

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
// Probe values come from the engine's own enums (like src/engineVocab.ts), so a
// rename there fails here with a drift report instead of a false probe error.
const names = (e) => runtimeEnumNames(e);
const first = (e) => names(e)[0];
const ITEM = Motely.MotelyItemType;
const ofCategory = (c) => names(ITEM).filter((k) => (ITEM[k] & 0xf000) === Motely.MotelyItemTypeCategory[c]);
const ofRarity = (r) => ofCategory("Joker").filter((k) => (ITEM[k] & 0x0c00) === Motely.MotelyJokerRarity[r]);
const JOKER = first(Motely.MotelyJoker);
const CARD = ofCategory("Standardcard")[0];
const RARITY_CLAUSE_JOKER = {
  CommonJokerClause: ofRarity("Common")[0],
  UncommonJokerClause: ofRarity("Uncommon")[0],
  RareJokerClause: ofRarity("Rare")[0],
  LegendaryJokerClause: ofRarity("Legendary")[0],
};
/** Valid value per grammar valueProperty / clause property (shape per the engine source). */
const VALUE = {
  jokers: () => [JOKER],
  planets: () => [ofCategory("PlanetCard")[0]],
  spectrals: () => [ofCategory("SpectralCard")[0]],
  tarots: () => [ofCategory("TarotCard")[0]],
  vouchers: () => [first(Motely.MotelyVoucher)],
  tags: () => [first(Motely.MotelyTag)],
  bosses: () => [first(Motely.MotelyBossBlind)],
  packs: () => [first(Motely.MotelyBoosterPack)],
  pokerHands: () => ["Flush"],
  label: () => "probe",
  min: () => 1,
  max: () => 1,
  score: () => 1,
  antes: () => [1],
  rolls: () => [1],
  edition: () => first(Motely.MotelyItemEdition),
  stickers: () => [MOTELY_JOKER_STICKER[1]],
  rank: () => first(Motely.MotelyStandardcardRank),
  suit: () => first(Motely.MotelyStandardcardSuit),
  enhancement: () => first(Motely.MotelyItemEnhancement),
  seal: () => first(Motely.MotelyItemSeal),
  with: () => ({ luck: "X1", jokers: [JOKER] }),
  mult: () => 5,
  mode: () => "Sum",
  card: () => CARD,
  soulCardOnly: () => true,
  soulEditionRolls: () => 1,
  maxAnte: () => 8,
  boosterPacks: () => [1],
};
const flow = (v) => {
  if (Array.isArray(v)) return `[${v.join(", ")}]`;
  if (typeof v === "object" && v !== null)
    return `{ ${Object.entries(v).map(([k, val]) => `${k}: ${flow(val)}`).join(", ")} }`;
  return String(v);
};

/** `must:` with one clause; props are extra lines (already 4-space indented). */
const mustClause = (clauseLine, props = []) => `must:\n  ${clauseLine}\n` + props.map((l) => `    ${l}\n`).join("");

const discValue = (disc, d) => {
  if (disc === "and" || disc === "or") return null; // nested clause list, rendered on the clause line
  if (d.clause === "LegendarySoulOrderClause") return null; // entry list, rendered on the clause line
  if (d.clause === "StandardCardClause" || d.clause === "StartingDrawClause") return CARD;
  if (RARITY_CLAUSE_JOKER[d.clause]) return RARITY_CLAUSE_JOKER[d.clause];
  const make = VALUE[d.valueProperty];
  return make ? make() : "x";
};
const clauseDoc = (disc, props = []) => {
  if (disc === "and" || disc === "or") return mustClause(`- ${disc}:\n      - joker: [${JOKER}]`, props);
  if (DISCRIMINATORS[disc].clause === "LegendarySoulOrderClause")
    return mustClause(`- ${disc}:\n      - legendary: ${ofRarity("Legendary")[0]}\n        antes: [1]`, props);
  return mustClause(`- ${disc}: ${flow(discValue(disc, DISCRIMINATORS[disc]))}`, props);
};
/** sources-block values: bool switches vs int[] slot/roll lists (per the engine source). */
const sourceValue = (key) => (["requireMegaPack", "etherealTag", "omenGlobe", "charmTag"].includes(key) ? "true" : "[1]");

const probes = [];
const probe = (label, yaml) => probes.push({ label, yaml });

probe("root.id", "id: probe\n");
probe("root.name", "name: probe\n");
probe("root.description", "description: probe\n");
probe("root.author", "author: probe\n");
probe("root.deck", `deck: ${first(Motely.MotelyDeck)}\n`);
probe("root.stake", `stake: ${first(Motely.MotelyStake)}\n`);
probe("root.seeds", "seeds: [AAAA]\n");
probe("root.cutoff", "cutoff: 5\n");
for (const key of ["must", "should", "mustNot"]) probe(`root.${key}`, mustClause(`- joker: [${JOKER}]`));

for (const [disc, d] of Object.entries(DISCRIMINATORS)) {
  probe(disc, clauseDoc(disc));
}
// Clause-property probes: once per clause class (plural discriminators share the class).
const classDisc = {};
for (const [disc, d] of Object.entries(DISCRIMINATORS)) if (!classDisc[d.clause]) classDisc[d.clause] = disc;
for (const [cls, disc] of Object.entries(classDisc)) {
  const d = DISCRIMINATORS[disc];
  for (const key of CLAUSE_KEYS[cls]) {
    if (key === d.valueProperty) continue;
    if (key === "sources" || key === "legendarySources") {
      const blockKey = SOURCE_KEYS[`${cls}.${key}`]?.[0];
      if (!blockKey) continue; // no block for this clause: nothing to probe here
      probe(`${cls}.${key}`, clauseDoc(disc, [`${key}:`, `  ${blockKey}: ${sourceValue(blockKey)}`]));
      continue;
    }
    const make = VALUE[key];
    if (!make) {
      problems.push(`${cls}.${key}: no probe value known for this key — add one to check-vocab-drift.mjs`);
      continue;
    }
    probe(`${cls}.${key}`, clauseDoc(disc, [`${key}: ${flow(make())}`]));
  }
}
for (const [where, keys] of Object.entries(SOURCE_KEYS)) {
  const [clause, block] = where.split(".");
  const disc = Object.keys(DISCRIMINATORS).find((k) => DISCRIMINATORS[k].clause === clause);
  for (const key of keys) {
    probe(`${where}.${key}`, clauseDoc(disc, [`${block}:`, `  ${key}: ${sourceValue(key)}`]));
  }
}
// Run the probes in child-process batches: one poisoned or crashed process only
// costs its batch, and no process lives long enough for the finalizer bug to fire.
// The made-up-key guard gets its own batch: its throw poisons the runtime by design.
let keysChecked = 0;
const BATCH = 40;
const batches = [];
for (let at = 0; at < probes.length; at += BATCH) batches.push(probes.slice(at, at + BATCH));
batches.push([{ label: "guard.madeUpKey", yaml: "notAKey: 1\n" }]); // must throw or return a message, never load
const aggregate = [];
for (const batch of batches) {
  const child = spawnSync(process.execPath, ["--experimental-strip-types", fileURLToPath(import.meta.url), "--probes"], {
    input: JSON.stringify(batch),
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  let results;
  try {
    results = JSON.parse(child.stdout);
  } catch {
    problems.push(`engine probe batch ${batches.indexOf(batch) + 1} crashed the runtime (exit ${child.status}) — the engine rejected a probe hard enough to kill its process`);
    continue;
  }
  aggregate.push(...results);
}
let guardSawRejection = false;
for (const r of aggregate) {
  if (r.label === "guard.madeUpKey") {
    if (r.threw || r.result !== null) guardSawRejection = true;
    continue;
  }
  if (r.threw) {
    problems.push(`${r.label}: the engine rejected a valid probe — the grammar drifted from motely-wasm`);
  } else {
    keysChecked += 1;
    if (r.result !== null) problems.push(`${r.label}: ${r.result}`);
  }
}
if (!guardSawRejection) {
  problems.push("JamlConfigLoader.check accepted a made-up key; the grammar probe cannot tell mapped from unmapped");
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
process.exit(0);
