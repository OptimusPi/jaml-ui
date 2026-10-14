// CodeMirror 6 language service for filter YAML, built only from the engine.
//
// Lint is motely-wasm's own loader verdict (JamlConfigLoader.check): null, or a message
// naming the line ("JAML line 20: ..."), placed on that line. Completion reads the loader
// grammar (engineGrammar.generated.ts, generated from MotelyJAML's JamlConfigLoader) and
// motely-wasm's item enums (src/engineVocab.ts). No keys or names are hand-listed here.

import type { CompletionContext, CompletionResult, Completion } from "@codemirror/autocomplete";
import { linter, type Diagnostic as CMDiagnostic } from "@codemirror/lint";
import bootsharp, { JamlConfigLoader } from "motely-wasm";

import { ENGINE_ENUMS as E } from "../../engineVocab.js";
import { CLAUSE_KEYS, DISCRIMINATORS, ROOT_KEYS, SOURCE_KEYS } from "./engineGrammar.generated.js";

type Discriminator = { clause: string; valueProperty: string | null; valueIsList: boolean };
const DISC = DISCRIMINATORS as Record<string, Discriminator>;

/** Which item list a key's value is drawn from. */
const VALUE_LIST: Record<string, readonly string[]> = {
  jokers: E.MotelyJoker,
  planets: E.MotelyPlanetCard,
  spectrals: E.MotelySpectralCard,
  tarots: E.MotelyTarotCard,
  vouchers: E.MotelyVoucher,
  tags: E.MotelyTag,
  bosses: E.MotelyBossBlind,
  deck: E.MotelyDeck,
  stake: E.MotelyStake,
  edition: E.MotelyItemEdition,
  enhancement: E.MotelyItemEnhancement,
  seal: E.MotelyItemSeal,
  stickers: E.MotelyJokerSticker,
};
const JOKER_LIST: Record<string, readonly string[]> = {
  commonJoker: E.MotelyJokerCommon,
  commonJokers: E.MotelyJokerCommon,
  uncommonJoker: E.MotelyJokerUncommon,
  uncommonJokers: E.MotelyJokerUncommon,
  rareJoker: E.MotelyJokerRare,
  rareJokers: E.MotelyJokerRare,
  legendaryJoker: E.MotelyJokerLegendary,
  legendaryJokers: E.MotelyJokerLegendary,
};

function valuesFor(key: string): readonly string[] | null {
  if (JOKER_LIST[key]) return JOKER_LIST[key];
  const d = DISC[key];
  if (d?.valueProperty) return VALUE_LIST[d.valueProperty] ?? null;
  return VALUE_LIST[key] ?? null;
}

const KEY_OPTIONS: Completion[] = (() => {
  const seen = new Set<string>();
  const all: Completion[] = [
    ...ROOT_KEYS.map((k) => ({ label: k, type: "keyword", detail: "document" })),
    ...Object.keys(DISC).map((k) => ({ label: k, type: "property", detail: `clause → ${DISC[k].clause}` })),
    ...[...new Set(Object.values(CLAUSE_KEYS).flat())].map((k) => ({ label: k, type: "property", detail: "clause key" })),
    ...[...new Set(Object.values(SOURCE_KEYS).flat())].map((k) => ({ label: k, type: "property", detail: "sources key" })),
  ];
  return all.filter((o) => (seen.has(o.label) ? false : (seen.add(o.label), true)));
})();

/**
 * Completion: after `key:` the engine's names for that key (`legendaryJoker: ` → the five
 * legendaries); elsewhere every key the loader maps.
 */
export function jamlCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[\w-]*/);
  if (!context.explicit && word && word.from === word.to) return null;
  const line = context.state.doc.lineAt(context.pos);
  const before = line.text.slice(0, context.pos - line.from);
  const valueOf = /^\s*-?\s*(\w+):\s*\[?(?:[\w-]+,\s*)*[\w-]*$/.exec(before);
  const from = word ? word.from : context.pos;
  if (valueOf) {
    const list = valuesFor(valueOf[1]);
    if (!list) return null;
    return { from, options: list.map((v) => ({ label: v, type: "constant", detail: valueOf[1] })), validFor: /^[\w-]*$/ };
  }
  return { from, options: KEY_OPTIONS, validFor: /^[\w-]*$/ };
}

async function engineCheck(text: string): Promise<string | null> {
  if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
  return JamlConfigLoader.check(text);
}

/** Lint from the engine loader's verdict, pinned to the line its message names. */
export const jamlLinter = linter(async (view): Promise<CMDiagnostic[]> => {
  const doc = view.state.doc;
  const message = await engineCheck(doc.toString());
  if (!message) return [];
  const m = /\bline (\d+)\b/i.exec(message);
  const line = doc.line(m ? Math.min(Math.max(1, Number(m[1])), doc.lines) : 1);
  return [{ from: line.from, to: line.to, severity: "error", message, source: "motely-wasm" }];
});
