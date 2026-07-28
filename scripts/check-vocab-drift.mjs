/**
 * Vocabulary drift guard.
 *
 * This package takes engine vocabulary from two independently-versioned
 * upstreams:
 *
 *   jaml-lang   — generated *name lists* (strings), used for authoring,
 *                 pickers and validation.
 *   motely-wasm — the *runtime numeric enums*, used to decode packed values
 *                 that come back from a search.
 *
 * Both are generated from the same Motely engine, but nothing in the dependency
 * graph forces the two installed versions to describe the *same engine build*.
 * When they disagree the UI quietly shows a name the engine never meant. This
 * script turns that silent failure into a build failure.
 *
 * Scope — what this can and cannot check:
 *
 *   Names, across packages (check 1). This is the only seam that exists between
 *   the two, because jaml-lang exposes *no ordinals at all*: its arrays are
 *   alphabetically sorted name lists, while motely-wasm's values are bitpacked
 *   (MotelyItemEdition.Foil is 8_388_608, not 1). There is nothing to align an
 *   ordinal against, so cross-package ordinal comparison is not expressible.
 *
 *   Ordinals, within motely-wasm (check 3). Every ordinal-to-name decode in this
 *   package reads motely-wasm's own enum (`MotelyBossBlind[boss]`) on a value
 *   that motely-wasm's own WASM produced, so the two sides of a decode always
 *   ship together and cannot drift apart. What *can* still corrupt a decode is a
 *   collision inside one of those enums — two names sharing a value makes the
 *   reverse lookup silently return the wrong one. That is checkable, so it is
 *   checked.
 *
 * Run: pnpm vocab:check
 */
import { Vocab } from "jaml-lang";
import * as Motely from "motely-wasm";

const jamlLang = Vocab.Enums;
const problems = [];
const notes = [];

/** motely-wasm ships numeric enums — string keys are the names. */
function runtimeEnumNames(enumObject) {
  return Object.keys(enumObject).filter((key) => Number.isNaN(Number(key)));
}

// ── 1. Every enum both packages ship must agree, name for name ──────────────
let compared = 0;
for (const [kind, names] of Object.entries(jamlLang)) {
  const runtime = Motely[kind];
  if (runtime === undefined || typeof runtime !== "object") {
    // Not every name list has a runtime counterpart exported (jokers, tarots,
    // spectrals and planets are name-only today). Nothing to cross-check.
    notes.push(`${kind}: name-only (${names.length}) — no motely-wasm export to compare`);
    continue;
  }

  compared += 1;
  const fromRuntime = new Set(runtimeEnumNames(runtime));
  const fromNames = new Set(names);

  const missingFromRuntime = [...fromNames].filter((n) => !fromRuntime.has(n));
  const missingFromNames = [...fromRuntime].filter((n) => !fromNames.has(n));

  if (missingFromRuntime.length || missingFromNames.length) {
    problems.push(
      `${kind}: jaml-lang has ${fromNames.size}, motely-wasm has ${fromRuntime.size}\n` +
        (missingFromRuntime.length
          ? `    only in jaml-lang:   ${missingFromRuntime.join(", ")}\n`
          : "") +
        (missingFromNames.length
          ? `    only in motely-wasm: ${missingFromNames.join(", ")}\n`
          : ""),
    );
  }
}

// ── 2. The rarity tiers must still partition the full joker list ────────────
// src/vocab.ts derives legendaries by subtraction (full set minus the three
// named tiers) because the engine ships no legendary-name enum. If the engine
// ever adds a fifth rarity, those jokers silently become "legendary". Assert
// the arithmetic instead of trusting it.
const {
  MotelyJoker: allJokers,
  MotelyJokerCommon: common,
  MotelyJokerUncommon: uncommon,
  MotelyJokerRare: rare,
} = jamlLang;

if (allJokers && common && uncommon && rare) {
  const named = new Set([...common, ...uncommon, ...rare]);
  const leftovers = allJokers.filter((j) => !named.has(j));
  const EXPECTED_LEGENDARIES = 5; // Canio, Triboulet, Yorick, Chicot, Perkeo

  const strays = [...named].filter((j) => !allJokers.includes(j));
  if (strays.length) {
    problems.push(
      `joker rarity tiers contain names absent from MotelyJoker: ${strays.join(", ")}`,
    );
  }

  if (leftovers.length !== EXPECTED_LEGENDARIES) {
    problems.push(
      `expected ${EXPECTED_LEGENDARIES} legendary jokers (full set minus Common/Uncommon/Rare), ` +
        `got ${leftovers.length}: ${leftovers.join(", ")}\n` +
        `    A new rarity tier would land here silently — teach src/vocab.ts about it.`,
    );
  } else {
    notes.push(
      `joker tiers partition cleanly: ${common.length} common + ${uncommon.length} uncommon + ` +
        `${rare.length} rare + ${leftovers.length} legendary = ${allJokers.length}`,
    );
  }
} else {
  problems.push("jaml-lang Vocab is missing one of the joker rarity enums");
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
  const runtime = Motely[kind];
  if (runtime === undefined || typeof runtime !== "object") {
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

// ── report ──────────────────────────────────────────────────────────────────
for (const note of notes) console.log(`  · ${note}`);

if (problems.length) {
  console.error(`\n✗ vocabulary drift detected (${problems.length}):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    "\njaml-lang and motely-wasm describe different engine builds. Align the two\n" +
      "versions in package.json, or regenerate the stale one from Motely.\n",
  );
  process.exit(1);
}

console.log(
  `\n✓ vocabulary in sync — ${compared} enum(s) cross-checked, joker tiers partition, ` +
    `${roundTripped} decode enum(s) round-trip\n`,
);
