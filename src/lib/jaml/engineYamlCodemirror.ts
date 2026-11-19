// CodeMirror 6 language service for filter YAML, built only from the engine.
//
// Lint is motely-wasm's own loader verdict (JamlConfigLoader.check): null, or a message
// naming the line ("JAML line 20: ..."), placed on that line. Completion reads the grammar
// the engine package ships (motely-wasm/jaml/vocab.json, through ./engineGrammar.ts): every
// key, and for each key the names its value is drawn from. No keys or names are listed here.

import type { CompletionContext, CompletionResult, Completion } from "@codemirror/autocomplete";
import { linter, type Diagnostic as CMDiagnostic } from "@codemirror/lint";
import bootsharp, { JamlConfigLoader } from "motely-wasm";

import { GRAMMAR_KEYS, namesFor } from "./engineGrammar.js";

const KEY_OPTIONS: Completion[] = GRAMMAR_KEYS.map(({ key, where, detail }) => ({
  label: key,
  type: where === "document" ? "keyword" : "property",
  detail,
}));

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
    const list = namesFor(valueOf[1]);
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
