// Item names straight from the engine package: every list here is an enum of
// motely-wasm/jaml/vocab.json, which the engine's own tests write from its enums, in the
// engine's order. Measured on engine 32.1.0: 150 jokers (61 common, 64 uncommon, 20 rare,
// 5 legendary), 22 tarots, 18 spectrals, 12 planets. scripts/check-vocab-drift.mjs checks the
// lists against the enums of the installed wasm binary.
import { GRAMMAR } from "./lib/jaml/engineGrammar.js";

/** One table, keyed by the engine enum names, read by every consumer. */
export const ENGINE_ENUMS: Readonly<Record<string, readonly string[]>> = GRAMMAR.enums;
