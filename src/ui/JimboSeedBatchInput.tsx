"use client";

import React, { useCallback, useMemo, useState } from "react";
import { JimboBox } from "./JimboBox.js";
import { JimboButton } from "./JimboButton.js";
import { JimboText } from "./jimboText.js";
import { JimboBadge } from "./JimboBadge.js";
import { JimboRow, JimboStack } from "./JimboLayout.js";
import { JimboTextArea } from "./JimboTextArea.js";

const SEED_ALPHABET = /^[1-9A-Z]{1,8}$/;
const NOT_SEEDS = new Set([
  "SEED", "SEEDS", "SCORE", "SCORES", "DECK", "STAKE", "NAME", "ANTE", "ANTES",
  "TRUE", "FALSE", "NULL", "NAN", "HTTP", "HTTPS", "WWW", "COM", "APP", "MUST",
  "SHOULD", "JOKER", "TAG", "BOSS", "PACK", "SHOP", "CARD", "TALLY", "TALLIES",
]);

/** Pull seed codes out of arbitrary pasted text. Same logic as seedfinder's
 *  parseSeedList, but self-contained so jaml-ui does not depend on app code. */
function extractSeeds(text) {
  if (!text || typeof text !== "string") return [];
  const scrubbed = text
    .toUpperCase()
    .replace(/[A-Z]+:\/\/\S*/g, " ")   // drop URLs whole
    .replace(/0/g, "O");                  // Balatro converts 0→O
  const tokens = scrubbed
    .split(/[^0-9A-Z]+/)
    .filter((t) => SEED_ALPHABET.test(t));
  const full = tokens.filter((t) => t.length === 8);
  const chosen = full.length
    ? full
    : tokens.filter((t) => t.length >= 4 && !NOT_SEEDS.has(t));
  return [...new Set(chosen)];
}

function invalidTokens(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const bad = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const tokens = line.split(/[^0-9A-Za-z]+/).filter(Boolean);
    for (const tok of tokens) {
      const clean = tok.toUpperCase().replace(/0/g, "O");
      if (!SEED_ALPHABET.test(clean) || clean.length < 4) {
        bad.push({ line: i + 1, text: tok });
      }
    }
  }
  return bad.slice(0, 8);
}

export interface JimboSeedBatchInputProps {
  /** Called with the cleaned seed list when the user hits Analyze. */
  onAnalyze: (seeds: string[]) => void;
  /** Optional: also inject seeds into the JAML document as a `seeds:` block. */
  onInjectIntoJaml?: (seeds: string[]) => void;
  /** Whether the engine is ready to analyze. */
  ready?: boolean;
  /** Whether an analysis is currently running. */
  running?: boolean;
  /** Optional pre-filled text (e.g. from clipboard sniff). */
  defaultText?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A concrete surface for batch seed input.
 *
 * Aphantasia UX: every state is described in words, not shown by position or
 * color alone. The user always knows:
 *   - how many seeds were found
 *   - how many are valid (8 chars)
 *   - how many are partial (4-7 chars — maybe typos)
 *   - what the next action is called and what it will do
 *
 * The textarea is the only input. Paste anywhere inside it. No hidden
 * shortcuts. The Analyze button is disabled with a sentence explaining why.
 */
export function JimboSeedBatchInput({
  onAnalyze,
  onInjectIntoJaml,
  ready = false,
  running = false,
  defaultText = "",
  className,
  style,
}: JimboSeedBatchInputProps) {
  const [text, setText] = useState(defaultText);
  const [showInvalid, setShowInvalid] = useState(false);

  const seeds = useMemo(() => extractSeeds(text), [text]);
  const full = useMemo(() => seeds.filter((s) => s.length === 8), [seeds]);
  const partial = useMemo(() => seeds.filter((s) => s.length >= 4 && s.length < 8), [seeds]);
  const bad = useMemo(() => invalidTokens(text), [text]);

  const handleAnalyze = useCallback(() => {
    if (!full.length || running) return;
    onAnalyze(full);
  }, [full, running, onAnalyze]);

  const handleInject = useCallback(() => {
    if (!full.length) return;
    onInjectIntoJaml?.(full);
  }, [full, onInjectIntoJaml]);

  const countLabel = full.length === 0
    ? "No valid 8-character seeds yet."
    : full.length === 1
    ? "1 valid seed."
    : `${full.length} valid seeds.`;

  const partialLabel = partial.length > 0
    ? `${partial.length} partial (${partial.join(", ")}) — might be typos.`
    : null;

  const canAnalyze = ready && !running && full.length > 0;
  const whyDisabled = running
    ? "Cannot start: a search is already running."
    : !ready
    ? "Cannot start: the engine is still booting."
    : full.length === 0
    ? "Cannot start: paste at least one 8-character seed."
    : null;

  return (
    <JimboStack gap="md" align="stretch" className={className} style={style}>
      <JimboBox>
        <JimboText size="sm" tone="white">
          Paste a list of seeds here — one per line, comma-separated, from a
          spreadsheet, a chat message, or a share link. The field finds every
          8-character code automatically.
        </JimboText>
      </JimboBox>

      <JimboTextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`WEEJOKER\n18Z47K9Q\nQ1J3A11E\n…`}
        spellCheck={false}
        autoComplete="off"
        style={{ minHeight: 120, fontFamily: "m6x11, monospace", fontSize: 14 }}
      />

      <JimboRow gap="sm" wrap align="center">
        <JimboBadge tone={full.length > 0 ? "green" : "grey"} size="sm">
          {countLabel}
        </JimboBadge>
        {partialLabel ? (
          <JimboBadge tone="orange" size="sm" title={partialLabel}>
            {partial.length} partial
          </JimboBadge>
        ) : null}
        {bad.length > 0 ? (
          <JimboBadge
            tone="red"
            size="sm"
            title={bad.map((b) => `line ${b.line}: "${b.text}"`).join("; ")}
          >
            {bad.length} unrecognised
          </JimboBadge>
        ) : null}
      </JimboRow>

      {bad.length > 0 && showInvalid ? (
        <JimboBox>
          {bad.map((b) => (
            <JimboText key={`${b.line}-${b.text}`} size="xs" tone="red">
              Line {b.line}: "{b.text}" — not a valid seed character.
            </JimboText>
          ))}
        </JimboBox>
      ) : null}

      {bad.length > 0 ? (
        <JimboButton size="xs" tone="grey" onClick={() => setShowInvalid((v) => !v)}>
          {showInvalid ? "Hide unrecognised tokens" : "Show unrecognised tokens"}
        </JimboButton>
      ) : null}

      <JimboButton
        fullWidth
        tone="blue"
        disabled={!canAnalyze}
        onClick={handleAnalyze}
        title={whyDisabled || "Score every seed against the current filter"}
      >
        {running ? "Searching…" : `Analyze ${full.length || ""} seed${full.length === 1 ? "" : "s"}`}
      </JimboButton>

      {onInjectIntoJaml && full.length > 0 ? (
        <JimboButton
          fullWidth
          tone="grey"
          onClick={handleInject}
          title="Add these seeds to the JAML document so they are saved with the filter"
        >
          Save seeds to filter document
        </JimboButton>
      ) : null}

      {whyDisabled && !running ? (
        <JimboText size="xs" tone="grey">
          {whyDisabled}
        </JimboText>
      ) : null}
    </JimboStack>
  );
}
