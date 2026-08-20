export type JamlClauseKind = "must" | "should" | "mustNot";

export type JamlItemType =
  | "joker"
  | "voucher"
  | "boss"
  | "tag"
  | "tarot"
  | "planet"
  | "spectral"
  | "consumable"
  | "standardcard"
  | "deck"
  | "stake"
  | "seed"
  | "any"
  | "unknown";

export interface ParsedJamlClause {
  kind: JamlClauseKind;
  itemType: JamlItemType;
  /** Exact names as written in JAML (e.g. "WeeJoker"). */
  names: string[];
  /** Optional explicit ante window. */
  antes?: number[];
  /** Score weight for should clauses; 0 for must/mustNot. */
  score: number;
  /** Optional user-facing label; falls back to a generated one. */
  label: string;
  /** Raw clause object for advanced consumers. */
  raw: Record<string, unknown>;
}

const ITEM_KEYS: JamlItemType[] = [
  "joker",
  "voucher",
  "boss",
  "tag",
  "tarot",
  "planet",
  "spectral",
  "consumable",
  "standardcard",
  "deck",
  "stake",
  "seed",
];

function asArray<T>(value: unknown): T[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value as T[];
  return [value as T];
}

function toStringArray(value: unknown): string[] {
  return asArray<string>(value).filter((v): v is string => typeof v === "string");
}

function extractNames(clause: Record<string, unknown>): { itemType: JamlItemType; names: string[] } {
  for (const key of ITEM_KEYS) {
    if (key in clause) {
      return { itemType: key, names: toStringArray(clause[key]) };
    }
  }
  // "any" is a wildcard catch-all supported by some JAML dialects.
  if ("any" in clause) return { itemType: "any", names: [] };
  return { itemType: "unknown", names: [] };
}

function parseClauseList(kind: JamlClauseKind, list: unknown): ParsedJamlClause[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((c): c is Record<string, unknown> => c !== null && typeof c === "object")
    .map((clause) => {
      const { itemType, names } = extractNames(clause);
      const antes = Array.isArray(clause.antes)
        ? clause.antes.filter((n): n is number => typeof n === "number").map((n) => Math.floor(n))
        : undefined;
      const score = typeof clause.score === "number" ? clause.score : 0;
      const label = typeof clause.label === "string" && clause.label.trim()
        ? clause.label
        : names.length > 0
          ? `${itemType}: ${names.join(", ")}`
          : `${itemType}`;
      return {
        kind,
        itemType,
        names,
        antes,
        score,
        label,
        raw: clause,
      };
    })
    .filter((c) => c.itemType !== "unknown" || c.raw.label);
}

export interface ParsedJamlFilters {
  deck?: string;
  stake?: string;
  must: ParsedJamlClause[];
  should: ParsedJamlClause[];
  mustNot: ParsedJamlClause[];
  all: ParsedJamlClause[];
}

function parseValue(val: string): unknown {
  const trimmed = val.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (!isNaN(Number(s)) ? Number(s) : s.replace(/^["']|["']$/g, "")));
  }
  if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;
  return trimmed.replace(/^["']|["']$/g, "");
}

/** Pure line-based JAML parser without generic YAML library dependencies */
export function parseJamlDocument(jamlText: string): Record<string, unknown> {
  const lines = jamlText.split(/\r?\n/);
  const doc: Record<string, unknown> = {};
  let currentSection: "must" | "should" | "mustNot" | null = null;
  let currentList: Record<string, unknown>[] = [];
  let currentItem: Record<string, unknown> | null = null;

  for (let rawLine of lines) {
    const commentIdx = rawLine.indexOf("#");
    if (commentIdx >= 0) rawLine = rawLine.slice(0, commentIdx);
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const trimmed = line.trim();
    if (trimmed.startsWith("deck:")) {
      doc.deck = trimmed.slice(5).trim();
      currentSection = null;
      continue;
    }
    if (trimmed.startsWith("stake:")) {
      doc.stake = trimmed.slice(6).trim();
      currentSection = null;
      continue;
    }
    if (trimmed.startsWith("must:")) {
      currentSection = "must";
      currentList = [];
      doc.must = currentList;
      continue;
    }
    if (trimmed.startsWith("should:")) {
      currentSection = "should";
      currentList = [];
      doc.should = currentList;
      continue;
    }
    if (trimmed.startsWith("mustNot:") || trimmed.startsWith("must_not:")) {
      currentSection = "mustNot";
      currentList = [];
      doc.mustNot = currentList;
      continue;
    }

    if (currentSection) {
      if (trimmed.startsWith("- ")) {
        currentItem = {};
        currentList.push(currentItem);
        const rest = trimmed.slice(2).trim();
        if (rest) {
          const colon = rest.indexOf(":");
          if (colon >= 0) {
            const k = rest.slice(0, colon).trim();
            const v = rest.slice(colon + 1).trim();
            currentItem[k] = parseValue(v);
          }
        }
      } else if (currentItem && (line.startsWith("    ") || (line.startsWith("  ") && !trimmed.startsWith("- ")))) {
        const colon = trimmed.indexOf(":");
        if (colon >= 0) {
          const k = trimmed.slice(0, colon).trim();
          const v = trimmed.slice(colon + 1).trim();
          currentItem[k] = parseValue(v);
        }
      }
    }
  }

  return doc;
}

export function parseJamlClauses(jamlText: string): ParsedJamlFilters {
  let doc: Record<string, unknown> = {};
  try {
    doc = parseJamlDocument(jamlText);
  } catch {
    // Graceful fallback for empty / malformed text
  }

  const must = parseClauseList("must", doc.must);
  const should = parseClauseList("should", doc.should);
  const mustNot = parseClauseList("mustNot", doc.mustNot);

  return {
    deck: typeof doc.deck === "string" ? doc.deck : undefined,
    stake: typeof doc.stake === "string" ? doc.stake : undefined,
    must,
    should,
    mustNot,
    all: [...must, ...should, ...mustNot],
  };
}

export function highlightClassForKind(kind: JamlClauseKind): string {
  switch (kind) {
    case "must":
      return "j-highlight--must";
    case "should":
      return "j-highlight--should";
    case "mustNot":
      return "j-highlight--must-not";
  }
}

export function splitCamelCase(key: string): string {
  return key.replace(/([A-Z])/g, " $1").trim();
}

export function normalizeName(name: string): string {
  return splitCamelCase(name).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function matchClauseToItem(
  clause: ParsedJamlClause,
  itemType: string,
  itemName: string
): boolean {
  if (clause.itemType === "any") return true;

  const normalizedTargetType = itemType.toLowerCase().replace(/[^a-z]/g, "");
  const normalizedClauseType = clause.itemType.toLowerCase().replace(/[^a-z]/g, "");

  if (normalizedTargetType !== normalizedClauseType) {
    // Treat general consumable matches (tarot/planet/spectral under consumable)
    if (
      normalizedClauseType === "consumable" &&
      ["tarot", "planet", "spectral"].includes(normalizedTargetType)
    ) {
      // Continue to name check
    } else {
      return false;
    }
  }

  if (clause.names.length === 0) return true;

  const normalizedTargetName = normalizeName(itemName);
  return clause.names.some((n) => normalizeName(n) === normalizedTargetName);
}

export function matchClauseToAnte(clause: ParsedJamlClause, ante: number): boolean {
  if (!clause.antes || clause.antes.length === 0) return true;
  return clause.antes.includes(ante);
}

export function matchMotelyItemToClause(
  decodedItem: {
    category?: string;
    kind?: string;
    displayName?: string;
    name?: string;
    enumKey?: string;
  },
  clause: ParsedJamlClause
): boolean {
  const itemType = decodedItem.category || decodedItem.kind || "";
  const name = decodedItem.displayName || decodedItem.name || decodedItem.enumKey || "";
  return matchClauseToItem(clause, itemType, name);
}
