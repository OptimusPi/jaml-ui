// The filter grammar, read from the engine package: motely-wasm/jaml/vocab.json is written by
// the engine's own tests from what its loader binds (keys and members off YamlDotNet's static
// type inspector, names off the enums). Nothing in this file lists a key or a name.

import vocab from "motely-wasm/jaml/vocab.json" with { type: "json" };

/** What a member takes: `form` is the engine's word for its shape, `enum` the name list it draws from, `type` the nested mapping. */
export interface GrammarMember {
  form: string;
  enum?: string;
  type?: string;
  required?: boolean;
}

export interface Grammar {
  /** Top-level document keys. */
  root: Record<string, GrammarMember>;
  /** Clause key (`legendaryJoker`) -> the type it loads (`legendaryJokerClause`). */
  clauses: Record<string, string>;
  /** Every clause type and nested mapping: its members by the key a document writes. */
  types: Record<string, Record<string, GrammarMember>>;
  /** Every enum's names, in the engine's order. */
  enums: Record<string, string[]>;
}

export const GRAMMAR = vocab as Grammar;

const clauseTypes = new Set(Object.values(GRAMMAR.clauses));

/** Where each nested mapping sits: its type -> the key that holds it (`jokerSourceConfig` -> `sources`). */
const hostKeyOf: Record<string, string> = {};
for (const members of [GRAMMAR.root, ...Object.values(GRAMMAR.types)])
  for (const [key, member] of Object.entries(members))
    if (member.type && !clauseTypes.has(member.type)) hostKeyOf[member.type] ??= key;

/** Every key a document can write, once each, with where it goes. */
export const GRAMMAR_KEYS: readonly { key: string; where: "document" | "clause" | "member"; detail: string }[] = (() => {
  const seen = new Set<string>();
  const all: { key: string; where: "document" | "clause" | "member"; detail: string }[] = [];
  const add = (key: string, where: "document" | "clause" | "member", detail: string) => {
    if (!seen.has(key)) (seen.add(key), all.push({ key, where, detail }));
  };
  for (const key of Object.keys(GRAMMAR.root)) add(key, "document", "document");
  for (const [key, type] of Object.entries(GRAMMAR.clauses)) add(key, "clause", `clause → ${type}`);
  for (const [type, members] of Object.entries(GRAMMAR.types))
    for (const key of Object.keys(members)) add(key, "member", clauseTypes.has(type) ? "clause key" : `${hostKeyOf[type] ?? type} key`);
  return all;
})();

/**
 * The names a key's value is drawn from, or null when it takes no name. A clause key answers
 * for its own clause (`legendaryJoker` -> the five legendaries). A key that several types
 * share with different lists (`jokers`) answers with the widest one.
 */
export function namesFor(key: string): readonly string[] | null {
  const own = GRAMMAR.clauses[key];
  const candidates = own
    ? [GRAMMAR.types[own][key]]
    : [GRAMMAR.root[key], ...Object.values(GRAMMAR.types).map((members) => members[key])];
  let widest: readonly string[] | null = null;
  for (const member of candidates) {
    const names = member?.enum ? GRAMMAR.enums[member.enum] : undefined;
    if (names && (!widest || names.length > widest.length)) widest = names;
  }
  return widest;
}
