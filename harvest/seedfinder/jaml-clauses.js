/**
 * Structured clause editing over the SAME free-text .jaml document the
 * CodeMirror editor holds — the text stays the single source of truth (not
 * a separate {kind,name,antes,score} model we'd round-trip through). That
 * matters because real filters (Claude-authored or corpus-derived) commonly
 * carry a `sources:` sub-block (shopItems/boosterPacks) that a naive
 * parse-into-struct-then-regenerate cycle would silently drop. Every op here
 * is a targeted line splice: removing a clause deletes exactly its own line
 * range, editing antes/score touches only those two lines, and every other
 * clause's text (including any `sources:` it carries) is never touched.
 */

const ZONE_RE = /^(must|should|mustNot):\s*$/;
const ITEM_RE = /^-\s*([A-Za-z]+):\s*(.*)$/;
const ANTES_RE = /^antes?:\s*\[([^\]]*)\]/;
const SCORE_RE = /^score:\s*(-?\d+)/;

/**
 * @returns {{must: Block[], should: Block[], mustNot: Block[]}}
 * Block = { kind, name, antes: number[]|null, score: number|null, start, end }
 * start/end are inclusive line indices (0-based) spanning the clause's
 * header line through its last sub-line, i.e. the exact range to splice to
 * delete it whole.
 */
export function parseClauseBlocks(jaml) {
  const lines = String(jaml).split(/\r?\n/);
  const groups = { must: [], should: [], mustNot: [] };
  let zone = null;
  let cur = null;
  const flush = (end) => {
    if (cur && zone) groups[zone].push({ ...cur, end });
    cur = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/#.*$/, "");
    const t = line.trim();
    const zh = t.match(ZONE_RE);
    if (zh) { flush(i - 1); zone = zh[1]; continue; }
    if (!zone) continue;
    if (t !== "" && !/^[ \t]/.test(line)) { flush(i - 1); zone = null; continue; }
    if (t === "") continue;
    const item = t.match(ITEM_RE);
    if (item) { flush(i - 1); cur = { kind: item[1], name: item[2].trim(), antes: null, score: null, start: i }; continue; }
    if (!cur) continue;
    const am = t.match(ANTES_RE);
    if (am) cur.antes = am[1].split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    const sm = t.match(SCORE_RE);
    if (sm) cur.score = parseInt(sm[1], 10);
  }
  flush(lines.length - 1);
  return groups;
}

function clauseLines(kind, name, antes, score) {
  const out = ["  - " + kind + ": " + name];
  if (antes && antes.length) out.push("    antes: [" + antes.join(", ") + "]");
  if (score != null) out.push("    score: " + score);
  return out;
}

/** Deletes one clause's full line range. `zone`/`index` as returned by parseClauseBlocks. */
export function removeClause(jaml, zone, index) {
  const groups = parseClauseBlocks(jaml);
  const block = groups[zone] && groups[zone][index];
  if (!block) return jaml;
  const lines = String(jaml).split(/\r?\n/);
  lines.splice(block.start, block.end - block.start + 1);
  return lines.join("\n");
}

/**
 * Appends a brand-new clause to `zone` (creating the zone header if the
 * document doesn't have one yet).
 */
export function addClause(jaml, zone, { kind, name, antes, score }) {
  const lines = String(jaml).split(/\r?\n/);
  const groups = parseClauseBlocks(jaml);
  const existing = groups[zone];
  const newLines = clauseLines(kind, name, antes, score);
  if (existing.length > 0) {
    const insertAt = existing[existing.length - 1].end + 1;
    lines.splice(insertAt, 0, ...newLines);
    return lines.join("\n");
  }
  // No zone header yet — find it anyway (possible empty `must:` with nothing
  // under it isn't captured by parseClauseBlocks since it never sees an
  // item line) before falling back to appending a fresh section.
  const headerIdx = lines.findIndex((l) => l.trim() === zone + ":");
  if (headerIdx >= 0) {
    lines.splice(headerIdx + 1, 0, ...newLines);
    return lines.join("\n");
  }
  const trimmed = lines[lines.length - 1] === "" ? lines.slice(0, -1) : lines;
  return trimmed.concat([zone + ":", ...newLines, ""]).join("\n");
}

/**
 * Edits an existing clause's antes/score IN PLACE — only those two lines are
 * touched (inserted if missing, updated if present), everything else about
 * the clause (its header, any `sources:` sub-block) is left byte-identical.
 * Renaming the clause target (`name`) or its `kind` (the picker cascade
 * lets you go back and pick a different category mid-edit) also updates
 * the header line only.
 */
export function editClause(jaml, zone, index, { kind, name, antes, score }) {
  const groups = parseClauseBlocks(jaml);
  const block = groups[zone] && groups[zone][index];
  if (!block) return jaml;
  const lines = String(jaml).split(/\r?\n/);

  const nextKind = kind != null ? kind : block.kind;
  if (nextKind !== block.kind || (name != null && name !== block.name)) {
    lines[block.start] = "  - " + nextKind + ": " + (name != null ? name : block.name);
  }

  // Re-scan the (possibly renamed) block for its own antes:/score: lines —
  // block.start/end indices are still valid, only line CONTENTS may shift.
  let antesLine = -1;
  let scoreLine = -1;
  for (let i = block.start + 1; i <= block.end; i++) {
    const t = lines[i].trim();
    if (antesLine < 0 && ANTES_RE.test(t)) antesLine = i;
    if (scoreLine < 0 && SCORE_RE.test(t)) scoreLine = i;
  }

  if (antes != null) {
    if (antes.length) {
      const text = "    antes: [" + antes.join(", ") + "]";
      if (antesLine >= 0) {
        lines[antesLine] = text;
      } else {
        lines.splice(block.start + 1, 0, text);
        if (scoreLine >= 0) scoreLine += 1;
        antesLine = block.start + 1; // keep antesLine truthful so the score
                                      // insertion below can trust it instead
                                      // of re-deriving the same position.
      }
    } else if (antesLine >= 0) {
      // Antes explicitly cleared to [] — remove the line rather than leaving
      // a stale antes constraint the user just deselected.
      lines.splice(antesLine, 1);
      if (scoreLine > antesLine) scoreLine -= 1;
      antesLine = -1;
    }
  }

  if (score != null) {
    const text = "    score: " + score;
    if (scoreLine >= 0) lines[scoreLine] = text;
    // Insert right after the antes line WHEREVER IT ACTUALLY IS (not an
    // assumed block.start+2) — antesLine reflects the real, current
    // position through every branch above, so this is correct even for a
    // clause whose antes: line wasn't immediately after its header.
    else lines.splice(antesLine >= 0 ? antesLine + 1 : block.start + 1, 0, text);
  }

  return lines.join("\n");
}

/**
 * value of a top-level `key: value` line (name/deck/stake/...). Matches only
 * unindented lines — every top-level key in this JAML dialect starts at
 * column 0, so this can't be shadowed by an indented clause sub-field that
 * happens to share the same key name.
 */
export function readField(jaml, key) {
  for (const raw of String(jaml).split(/\r?\n/)) {
    if (/^\s/.test(raw)) continue;
    const line = raw.trim();
    if (line.indexOf(key + ":") === 0) return line.slice(key.length + 1).trim() || undefined;
  }
  return undefined;
}
