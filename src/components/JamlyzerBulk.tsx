"use client";

import { useMemo, useState } from "react";
import type { MotelyJamlyzerSeedResult, MotelyJamlyzerAnteResult } from "motely-wasm";
import { JamlyzerView } from "./JamlyzerView.js";
import { decodeMotelyItem } from "../decode/motelyItemDecoder.js";
import { JimboPanel } from "../ui/JimboPanel.js";
import { JimboInnerPanel } from "../ui/panel.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboBadge } from "../ui/JimboBadge.js";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboRow, JimboStack } from "../ui/JimboLayout.js";
import { JimboSeedCopyChip } from "../ui/JimboSeedCopyChip.js";
import {
  parseJaml,
  type JamlClause,
  matchMotelyItemToClause,
  matchClauseToAnte,
} from "../lib/jaml/jaml.js";

export interface JamlyzerBulkProps {
  results: MotelyJamlyzerSeedResult[];
  /** Raw JAML text; used to derive clause identities if `clauses` is not provided. */
  jamlText?: string;
  /** Pre-parsed clauses (alternative to `jamlText`). */
  clauses?: JamlClause[];
  /** Per-seed per-should-clause tally values, in JAML order. */
  tallies?: (number[] | Int32Array)[];
  /** Optional deck/stake applied to every seed in the bulk view. */
  deck?: number;
  stake?: number;
  pageSize?: number;
}

function pullItems(ante: MotelyJamlyzerAnteResult): MotelyJamlyzerAnteResult["pulls"]["judgementJokers"] {
  return [
    ...ante.pulls.judgementJokers,
    ...ante.pulls.wraithJokers,
    ...ante.pulls.emperorTarots,
    ...ante.pulls.purpleSealTarots,
    ...ante.pulls.sixthSenseSpectrals,
    ...ante.pulls.seanceSpectrals,
    ...ante.pulls.riffRaffJokers,
    ...ante.pulls.rareTagJokers,
    ...ante.pulls.uncommonTagJokers,
    ...ante.pulls.legendaryJokers,
  ];
}

function seedClauseMatches(
  seedResult: MotelyJamlyzerSeedResult,
  clauses: JamlClause[]
): Map<JamlClause, number[]> {
  const map = new Map<JamlClause, number[]>();
  for (const clause of clauses) {
    const antes: number[] = [];
    for (const ante of seedResult.antes) {
      if (!matchClauseToAnte(clause, ante.ante)) continue;
      const allItems = [
        ...ante.shopItems,
        ...ante.packs.flatMap((p) => p.items),
        ...pullItems(ante),
      ];
      const matched = allItems.some((item) => {
        const decoded = decodeMotelyItem(item);
        return decoded ? matchMotelyItemToClause(decoded, clause) : false;
      });
      if (matched) antes.push(ante.ante);
    }
    map.set(clause, antes);
  }
  return map;
}

export function ClauseHitPanel({
  clause,
  hitAntes,
  tally,
}: {
  clause: JamlClause;
  hitAntes: number[];
  tally?: number;
}) {
  const label =
    clause.kind === "must" ? `Must · ${clause.label}` : clause.kind === "mustNot" ? `Not · ${clause.label}` : clause.label;
  const labelTone = clause.kind === "must" ? "red" : "grey";
  const badgeTone = clause.kind === "must" ? "red" : clause.kind === "mustNot" ? "grey" : "green";
  return (
    <JimboInnerPanel className="j-stack j-stack--gap-xs">
      <JimboText size="xs" tone={labelTone}>
        {label}
        {tally !== undefined && <JimboText size="xs" tone="green"> ({tally})</JimboText>}
      </JimboText>
      <JimboRow wrap gap="xs" align="center">
        {hitAntes.length > 0 ? (
          hitAntes.map((n) => (
            <JimboBadge key={n} tone={badgeTone} size="sm">
              Ante {n}
            </JimboBadge>
          ))
        ) : (
          <JimboText size="micro" tone="grey">
            no hits
          </JimboText>
        )}
      </JimboRow>
    </JimboInnerPanel>
  );
}

export function JamlyzerBulk({
  results,
  jamlText,
  clauses: clausesProp,
  tallies,
  deck,
  stake,
  pageSize = 25,
}: JamlyzerBulkProps) {
  const [expandedSeed, setExpandedSeed] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const clauses = useMemo(() => {
    if (clausesProp) return clausesProp;
    if (jamlText) return parseJaml(jamlText).all;
    return [];
  }, [clausesProp, jamlText]);

  const shouldClauses = useMemo(() => clauses.filter((c) => c.kind === "should"), [clauses]);
  const otherClauses = useMemo(() => clauses.filter((c) => c.kind !== "should"), [clauses]);

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedResults = useMemo(
    () => results.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [results, safePage, pageSize]
  );

  if (results.length === 0) {
    return (
      <JimboPanel body>
        <JimboText tone="grey">No seeds to analyze.</JimboText>
      </JimboPanel>
    );
  }

  return (
    <JimboPanel title="Bulk seed analysis" tone="gold">
      <JimboRow wrap gap="md" align="center" justify="between">
        <JimboText tone="grey">
          {results.length.toLocaleString()} seed{results.length === 1 ? "" : "s"} analyzed
        </JimboText>

        {totalPages > 1 && (
          <JimboRow gap="xs" align="center">
            <JimboButton
              size="xs"
              tone="blue"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </JimboButton>
            <JimboText size="xs" tone="grey">
              Page {safePage + 1} of {totalPages}
            </JimboText>
            <JimboButton
              size="xs"
              tone="blue"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </JimboButton>
          </JimboRow>
        )}
      </JimboRow>

      <JimboStack gap="sm" align="stretch">
        {pagedResults.map((result, index) => {
          const globalIndex = safePage * pageSize + index;
          const matches = seedClauseMatches(result, clauses);
          const isExpanded = expandedSeed === result.seed;
          const seedTallies = tallies && globalIndex < tallies.length ? tallies[globalIndex] : undefined;

          return (
            <JimboPanel key={result.seed} body>
              <JimboRow wrap gap="md" align="center">
                <JimboSeedCopyChip value={result.seed} />
                <JimboText tone="grey">
                  Score: <JimboText tone="gold">{result.score}</JimboText>
                </JimboText>
                <JimboButton
                  size="xs"
                  tone="blue"
                  onClick={() => setExpandedSeed(isExpanded ? null : result.seed)}
                  label={isExpanded ? "Collapse" : "Expand"}
                />
              </JimboRow>

              {shouldClauses.length > 0 && (
                <JimboRow wrap gap="md" align="start">
                  {shouldClauses.map((clause, i) => {
                    const tally = seedTallies && i < seedTallies.length ? seedTallies[i] : undefined;
                    return (
                      <ClauseHitPanel
                        key={i}
                        clause={clause}
                        hitAntes={matches.get(clause) ?? []}
                        tally={tally}
                      />
                    );
                  })}
                </JimboRow>
              )}

              {otherClauses.length > 0 && (
                <JimboRow wrap gap="md" align="start">
                  {otherClauses.map((clause, i) => (
                    <ClauseHitPanel
                      key={`other-${i}`}
                      clause={clause}
                      hitAntes={matches.get(clause) ?? []}
                    />
                  ))}
                </JimboRow>
              )}

              {isExpanded && (
                <JamlyzerView
                  result={result}
                  deck={deck}
                  stake={stake}
                />
              )}
            </JimboPanel>
          );
        })}
      </JimboStack>
    </JimboPanel>
  );
}
