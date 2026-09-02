"use client";

import React, { useEffect, useMemo, useState } from "react";
import bootsharp, { Analyze, type MotelyJamlyzerSeedResult, MotelyDeck, MotelyStake } from "motely-wasm";
import { parseJaml } from "../lib/jaml/jaml.js";
import { JimboPanel } from "../ui/JimboPanel.js";
import { JimboInnerPanel } from "../ui/panel.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboBadge } from "../ui/JimboBadge.js";
import { JimboStack, JimboRow } from "../ui/JimboLayout.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JamlyzerView } from "./JamlyzerView.js";
import { JamlyzerSeedCard } from "./jamlyzer/JamlyzerSeedCard.js";
import { JimboTextInput } from "../ui/JimboTextInput.js";
import { FiSearch, FiCheck, FiDownload, FiStar, FiX } from "react-icons/fi";

export interface JamlyzerProps {
  /** Full JAML document. Seeds come from the top-level `seeds:` array via Motely. */
  jaml?: string;
  /** Direct in-memory seeds array or pre-analyzed seed results. */
  seeds?: readonly (string | MotelyJamlyzerSeedResult)[];
  /** Pre-analyzed seed results. */
  results?: readonly MotelyJamlyzerSeedResult[];
  deck?: MotelyDeck | number;
  stake?: MotelyStake | number;
  maxAnte?: number;
  defaultSelectedSeed?: string;
  onSelectSeed?: (seed: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

type JamlyzerLoadState =
  | { status: "loading" }
  | { status: "ready"; seeds: readonly MotelyJamlyzerSeedResult[]; elapsedMs: number }
  | { status: "error"; message: string };

export type JamlyzerSortMode = "highest-score" | "ante1-hits" | "alpha";
export type JamlyzerFilterMode = "all" | "matches" | "pinned";

const PAGE_SIZE = 20;

export function Jamlyzer({
  jaml,
  seeds: seedsProp,
  results: resultsProp,
  deck,
  stake,
  maxAnte = 39,
  defaultSelectedSeed,
  onSelectSeed,
  className = "",
  style,
}: JamlyzerProps) {
  const [load, setLoad] = useState<JamlyzerLoadState>(() => {
    if (resultsProp && resultsProp.length > 0) {
      return { status: "ready", seeds: resultsProp, elapsedMs: 0 };
    }
    return { status: "loading" };
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<JamlyzerFilterMode>("all");
  const [sortMode, setSortMode] = useState<JamlyzerSortMode>("highest-score");
  const [pinnedSeeds, setPinnedSeeds] = useState<Set<string>>(() => new Set());
  const [selectedSeed, setSelectedSeed] = useState<string>(defaultSelectedSeed ?? "");
  const [page, setPage] = useState(0);
  const [copiedExport, setCopiedExport] = useState(false);

  const [lastJaml, setLastJaml] = useState(jaml);
  const [lastResults, setLastResults] = useState(resultsProp);

  const clauses = useMemo(() => {
    if (!jaml) return [];
    try {
      return parseJaml(jaml).all;
    } catch {
      return [];
    }
  }, [jaml]);

  if (resultsProp !== lastResults) {
    setLastResults(resultsProp);
    if (resultsProp) {
      setLoad({ status: "ready", seeds: resultsProp, elapsedMs: 0 });
    }
  }

  if (jaml !== lastJaml && !resultsProp) {
    setLastJaml(jaml);
    setLoad({ status: "loading" });
    setPage(0);
  }

  useEffect(() => {
    if (resultsProp && resultsProp.length > 0) return;

    let cancelled = false;

    void (async () => {
      try {
        if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
        const t0 = performance.now();

        let analyzed: MotelyJamlyzerSeedResult[] = [];

        if (jaml && jaml.trim().length > 0) {
          analyzed = Analyze.seeds(jaml.trim());
        } else if (seedsProp && seedsProp.length > 0) {
          const seedStrings = seedsProp.map((s) => (typeof s === "string" ? s : s.seed));
          const syntheticJaml = `seeds:\n${seedStrings.map((s) => `  - ${s}`).join("\n")}`;
          analyzed = Analyze.seeds(syntheticJaml);
        } else {
          throw new Error("No seeds or JAML filter provided.");
        }

        const elapsedMs = performance.now() - t0;
        if (cancelled) return;
        setLoad({ status: "ready", seeds: analyzed, elapsedMs });
      } catch (error) {
        if (cancelled) return;
        setLoad({
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jaml, seedsProp, resultsProp]);

  const allRows = useMemo(
    () => (load.status === "ready" ? load.seeds : []),
    [load]
  );

  const filteredAndSortedRows = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();

    const filtered = allRows.filter((row) => {
      if (q && !row.seed.toUpperCase().includes(q)) return false;
      const score = row.score ?? 0;
      if (filterMode === "matches" && score <= 0) return false;
      if (filterMode === "pinned" && !pinnedSeeds.has(row.seed)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      const aPinned = pinnedSeeds.has(a.seed);
      const bPinned = pinnedSeeds.has(b.seed);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      const aScore = a.score ?? 0;
      const bScore = b.score ?? 0;

      switch (sortMode) {
        case "highest-score":
          return bScore - aScore;
        case "ante1-hits": {
          const aA1 = (a.antes[0]?.shopItems.length ?? 0) + (a.antes[0]?.packs.length ?? 0);
          const bA1 = (b.antes[0]?.shopItems.length ?? 0) + (b.antes[0]?.packs.length ?? 0);
          return bA1 - aA1 || bScore - aScore;
        }
        case "alpha":
          return a.seed.localeCompare(b.seed);
        default:
          return bScore - aScore;
      }
    });
  }, [allRows, searchQuery, filterMode, sortMode, pinnedSeeds]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedRows = useMemo(
    () => filteredAndSortedRows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filteredAndSortedRows, safePage]
  );

  const activeResult = useMemo(
    () => allRows.find((r) => r.seed === selectedSeed) ?? pagedRows[0] ?? allRows[0],
    [allRows, selectedSeed, pagedRows]
  );

  const maxScore = useMemo(
    () => Math.max(0, ...allRows.map((r) => r.score ?? 0)),
    [allRows]
  );

  const matchCount = useMemo(
    () => allRows.filter((r) => (r.score ?? 0) > 0).length,
    [allRows]
  );

  const togglePin = (seed: string) => {
    setPinnedSeeds((prev) => {
      const next = new Set(prev);
      if (next.has(seed)) next.delete(seed);
      else next.add(seed);
      return next;
    });
  };

  const handleSelectSeed = (seed: string) => {
    setSelectedSeed(seed);
    onSelectSeed?.(seed);
  };

  const handleExportFiltered = async () => {
    const payload = {
      timestamp: new Date().toISOString(),
      totalAnalyzed: allRows.length,
      matches: filteredAndSortedRows.length,
      seeds: filteredAndSortedRows.map((r) => ({
        seed: r.seed,
        score: r.score,
        antes: r.antes.map((a) => ({
          ante: a.ante,
          boss: a.boss,
          voucher: a.voucher,
          shopItems: a.shopItems.map((i) => i.value),
        })),
      })),
    };
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopiedExport(true);
        setTimeout(() => setCopiedExport(false), 2000);
      }
    } catch {
      // Non-fatal clipboard failure
    }
  };

  const rootClass = ["j-jamlyzer", className].filter(Boolean).join(" ");

  if (load.status === "loading") {
    return (
      <JimboStack gap="sm" align="stretch" className={rootClass} style={style}>
        <JimboPanel className="j-jamlyzer__panel j-jamlyzer__panel--hint">
          <JimboText size="sm" tone="white" className="j-text-center">
            Analyzing candidate seeds with Motely WASM…
          </JimboText>
        </JimboPanel>
      </JimboStack>
    );
  }

  if (load.status === "error") {
    return (
      <JimboStack gap="sm" align="stretch" className={rootClass} style={style}>
        <JimboPanel className="j-jamlyzer__panel j-jamlyzer__panel--hint">
          <JimboText size="xs" tone="red" className="j-text-center">
            {load.message}
          </JimboText>
        </JimboPanel>
      </JimboStack>
    );
  }

  const { elapsedMs } = load;

  return (
    <JimboStack gap="md" align="stretch" className={rootClass} style={style}>
      <JimboInnerPanel className="j-jamlyzer-header">
        <JimboRow wrap gap="md" align="center" justify="between">
          <JimboRow gap="sm" align="center">
            <JimboBadge size="md" tone="orange">
              {allRows.length.toLocaleString()} Seeds
            </JimboBadge>
            <JimboBadge size="md" tone="green">
              {matchCount.toLocaleString()} Matches
            </JimboBadge>
            <JimboBadge size="md" tone="blue">
              Max Score {maxScore}
            </JimboBadge>
            <JimboText size="xs" tone="grey">
              {elapsedMs.toFixed(0)} ms
            </JimboText>
          </JimboRow>

          <JimboRow gap="xs" align="center">
            <JimboButton
              size="xs"
              tone={copiedExport ? "green" : "blue"}
              onClick={handleExportFiltered}
            >
              {copiedExport ? <FiCheck /> : <FiDownload />}
              {copiedExport ? "Copied JSON!" : "Export Matches"}
            </JimboButton>
          </JimboRow>
        </JimboRow>

        <JimboRow wrap gap="sm" align="center" justify="between" className="j-jamlyzer-toolbar">
          <JimboBox className="j-jamlyzer-search-wrap">
            <FiSearch className="j-jamlyzer-search-icon" />
            <JimboTextInput
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search seed (e.g. 18Z47K9Q)..."
              className="j-jamlyzer-search-input"
            />
            {searchQuery && (
              <JimboButton
                size="xs"
                tone="blue"
                onClick={() => setSearchQuery("")}
                className="j-jamlyzer-search-clear"
              >
                <FiX />
              </JimboButton>
            )}
          </JimboBox>

          <JimboRow gap="xs" align="center" className="j-jamlyzer-filter-chips">
            <JimboButton
              size="xs"
              tone="blue"
              onClick={() => {
                setFilterMode("all");
                setPage(0);
              }}
              data-pressed={filterMode === "all"}
            >
              All ({allRows.length})
            </JimboButton>

            <JimboButton
              size="xs"
              tone={filterMode === "matches" ? "green" : "blue"}
              onClick={() => {
                setFilterMode("matches");
                setPage(0);
              }}
              data-pressed={filterMode === "matches"}
            >
              Matches ({matchCount})
            </JimboButton>

            {pinnedSeeds.size > 0 && (
              <JimboButton
                size="xs"
                tone={filterMode === "pinned" ? "orange" : "blue"}
                onClick={() => {
                  setFilterMode("pinned");
                  setPage(0);
                }}
                data-pressed={filterMode === "pinned"}
              >
                <FiStar /> Pinned ({pinnedSeeds.size})
              </JimboButton>
            )}
          </JimboRow>

          <JimboRow gap="xs" align="center">
            <JimboText size="xs" tone="grey">
              Sort:
            </JimboText>
            <JimboButton
              size="xs"
              tone="blue"
              data-pressed={sortMode === "highest-score"}
              onClick={() => setSortMode("highest-score")}
            >
              Score ↓
            </JimboButton>
            <JimboButton
              size="xs"
              tone="blue"
              data-pressed={sortMode === "ante1-hits"}
              onClick={() => setSortMode("ante1-hits")}
            >
              Ante 1
            </JimboButton>
            <JimboButton
              size="xs"
              tone="blue"
              data-pressed={sortMode === "alpha"}
              onClick={() => setSortMode("alpha")}
            >
              A-Z
            </JimboButton>
          </JimboRow>
        </JimboRow>
      </JimboInnerPanel>

      <JimboBox className="j-jamlyzer-split">
        <JimboBox className="j-jamlyzer-candidate-pane">
          <JimboInnerPanel className="j-jamlyzer-candidate-header">
            <JimboRow gap="xs" align="center" justify="between">
              <JimboText size="xs" tone="gold">
                Showing {filteredAndSortedRows.length.toLocaleString()} candidate{filteredAndSortedRows.length === 1 ? "" : "s"}
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
                  <JimboText size="micro" tone="grey">
                    {safePage + 1}/{totalPages}
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
          </JimboInnerPanel>

          <JimboBox className="j-jamlyzer-candidate-list">
            {pagedRows.length === 0 ? (
              <JimboInnerPanel className="j-text-center">
                <JimboText size="xs" tone="grey">
                  No candidate seeds match your search filters.
                </JimboText>
              </JimboInnerPanel>
            ) : (
              pagedRows.map((row) => (
                <JamlyzerSeedCard
                  key={row.seed}
                  result={row}
                  selected={row.seed === activeResult?.seed}
                  pinned={pinnedSeeds.has(row.seed)}
                  onSelect={() => handleSelectSeed(row.seed)}
                  onTogglePin={() => togglePin(row.seed)}
                  maxScore={maxScore}
                  clauses={clauses}
                />
              ))
            )}
          </JimboBox>
        </JimboBox>

        <JimboBox className="j-jamlyzer-inspector-pane">
          {activeResult ? (
            <JamlyzerView
              result={activeResult}
              deck={deck}
              stake={stake}
              maxAnte={maxAnte}
            />
          ) : (
            <JimboPanel body>
              <JimboText size="sm" tone="grey" className="j-text-center">
                Select a candidate seed from the list to inspect Ante shops and booster packs.
              </JimboText>
            </JimboPanel>
          )}
        </JimboBox>
      </JimboBox>
    </JimboStack>
  );
}
