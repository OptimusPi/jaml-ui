/** Clause-to-item highlight matching for the Jamlyzer views. */

import {
  matchClauseToAnte,
  highlightClassForKind,
  normalizeName,
  type JamlClause,
  type JamlItemType,
} from "../../lib/jaml/jaml.js";
import type { MotelyRenderableCategory } from "../../decode/motelyItemDecoder.js";

export function itemTypeOfCategory(category: MotelyRenderableCategory): JamlItemType {
  switch (category) {
    case "playing":
      return "standardcard";
    case "joker":
      return "joker";
    case "tarot":
    case "planet":
    case "spectral":
      return category;
    case "consumable":
      return "consumable";
    default:
      return "unknown";
  }
}

export function buildMatchMap(clauses: JamlClause[]): Map<string, JamlClause[]> {
  const map = new Map<string, JamlClause[]>();
  for (const clause of clauses) {
    for (const name of clause.names) {
      const key = `${clause.itemType}:${normalizeName(name)}`;
      const list = map.get(key) ?? [];
      list.push(clause);
      map.set(key, list);
    }
  }
  return map;
}

export function selectHighlight(
  itemType: JamlItemType,
  name: string,
  ante: number,
  matches: Map<string, JamlClause[]>
): string | undefined {
  const key = `${itemType}:${normalizeName(name)}`;
  const clauses = matches.get(key) ?? [];
  const matching = clauses.filter((c) => matchClauseToAnte(c, ante));
  if (matching.length === 0) return undefined;
  // Prefer should, then must, then mustNot for the glow color.
  const primary =
    matching.find((c) => c.kind === "should") ??
    matching.find((c) => c.kind === "must") ??
    matching[0];
  return highlightClassForKind(primary.kind);
}
