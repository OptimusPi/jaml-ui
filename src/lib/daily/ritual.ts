/**
 * A daily ritual is a single JAML file. Nothing is hardcoded: the filter body is
 * real, engine-valid JAML (deck/stake/must/should), and the presentation metadata
 * rides as `# key: value` header comments so the validator never sees a key it
 * would reject. One `.jaml` file fully defines a ritual — title, flavor, hint, the
 * cards to show, and the filter to search.
 *
 * This is the shape `DailyRitualView` renders and the app authors in the UX. It is
 * pure parsing — no React, no hooks, no engine — so it runs in Node and the browser
 * alike and never needs a client boundary.
 */
export interface DailyRitual {
  /** Display title. From the JAML `name:` key, or a `# title:` comment, else "Daily Ritual". */
  title: string;
  /** One-line summary. From the JAML `description:` key or a `# description:` comment. */
  description?: string;
  /** Metadata carried as header comments so the filter stays engine-valid. */
  emoji?: string;
  flavor?: string;
  hint?: string;
  /** Rank to spotlight as a card sprite, e.g. "2", "K", "A". */
  focusRank?: string;
  /** Joker to spotlight as a card sprite, e.g. "WeeJoker". */
  targetJoker?: string;
  /** Optional theme label, e.g. "Foil Friday". */
  theme?: string;
  /** The raw JAML source, exactly as authored — the single source of truth. */
  jaml: string;
}

/** The metadata keys a ritual may carry as `# key: value` header comments. */
const META_KEYS = new Set([
  "title",
  "description",
  "emoji",
  "flavor",
  "hint",
  "focusRank",
  "targetJoker",
  "theme",
]);

/**
 * Parse a ritual from its JAML source.
 *
 * Two channels, by design:
 * - `# key: value` comment lines carry presentation metadata (emoji, flavor, hint,
 *   focusRank, targetJoker, theme, and optionally title/description).
 * - top-level `name:` and `description:` JAML keys are read as title/description
 *   when no comment overrides them, so a ritual authored as plain JAML still titles
 *   itself. Only single-line scalars are read here; a block scalar (`>` or `|`) is
 *   left to the metadata comment instead of half-parsed.
 *
 * The raw text is preserved verbatim on `.jaml`; the filter body is never rewritten.
 */
export function parseRitual(jamlText: string): DailyRitual {
  const meta: Record<string, string> = {};
  let name: string | undefined;
  let descKey: string | undefined;

  for (const rawLine of jamlText.split(/\r?\n/)) {
    const commentMatch = rawLine.match(/^\s*#\s*([A-Za-z]+)\s*:\s*(.+?)\s*$/);
    if (commentMatch) {
      const key = commentMatch[1];
      if (META_KEYS.has(key)) meta[key] = commentMatch[2];
      continue;
    }

    // Top-level keys only (column 0), single-line scalar values.
    const keyMatch = rawLine.match(/^([A-Za-z]+)\s*:\s*(.*)$/);
    if (!keyMatch) continue;
    const [, key, value] = keyMatch;
    const scalar = value.trim();
    if (key === "name" && scalar && scalar !== ">" && scalar !== "|") {
      name = scalar;
    } else if (key === "description" && scalar && scalar !== ">" && scalar !== "|") {
      descKey = scalar;
    }
  }

  return {
    title: meta.title ?? name ?? "Daily Ritual",
    description: meta.description ?? descKey,
    emoji: meta.emoji,
    flavor: meta.flavor,
    hint: meta.hint,
    focusRank: meta.focusRank,
    targetJoker: meta.targetJoker,
    theme: meta.theme,
    jaml: jamlText,
  };
}
