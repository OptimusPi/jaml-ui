"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import bootsharp, {
  CancellationToken,
  Errors,
  JamlConfigLoader,
  JamlSearchBuilder,
  type JamlConfig,
  type MotelyProgress,
  type MotelyScoredSeedResult,
} from "motely-wasm";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboDock } from "../ui/JimboDock.js";
import { JimboStack } from "../ui/JimboLayout.js";
import { JimboStatusPill } from "../ui/JimboStatusPill.js";
import { JimboText } from "../ui/jimboText.js";
import { JamlIde } from "./JamlIde.js";
import { Jamlyzer } from "./Jamlyzer.js";

export const STARTER_JAML = `must:
  - joker: Blueprint
    antes: [1]
should:
  - voucher: Telescope
    antes: [1]
`;

export const JAMLYZE_JAML = `seeds:
  - WEEJOKER
${STARTER_JAML}`;

/**
 * One search hit. `tallies` is motely-wasm 28's per-should-clause tally: one raw
 * occurrence count per `should:` clause, in authored order. Empty for an unscored filter.
 */
export type SeedHit = { seed: string; score: number; tallies: readonly number[] };

/**
 * Tally column headers: each should clause's own `label:` when the JAML gives one,
 * otherwise "Tally 1..N". Same order the engine fills `tallies` in.
 */
function tallyLabelsFor(config: JamlConfig): string[] {
  return config.should.map((clause, i) => clause.label ?? `Tally ${i + 1}`);
}

/*
 * Search window.
 *
 * Motely's space is every 8-character seed over its 35-glyph alphabet:
 *   35^8 = 2,251,875,390,625 seeds
 * (the same figure lib/jaml/rarityData.generated.ts measures its odds against).
 *
 * withBatchCharacterCount(n) splits a seed at character n: the batch *index*
 * enumerates the leading n characters and each batch sweeps the trailing 8-n.
 * At n = 4 that is 35^4 = 1,500,625 batches of 35^4 = 1,500,625 seeds each,
 * and 1,500,625^2 = 35^8 puts the whole space back together.
 *
 * So the [0, 2) window below is an exhaustive sweep of
 *   2 x 35^4 = 3,001,250 seeds
 * — same order of magnitude as the 2,000-random-seed probe this pane used to
 * run, but complete rather than sampled, and resumable: batch indices are
 * stable, so raising END_BATCH continues where the last window stopped.
 */
const BATCH_CHARS = 4;
const START_BATCH = 0n;
const END_BATCH = 2n;
const SEEDS_PER_BATCH = 35 ** BATCH_CHARS; // 1,500,625
const WINDOW_SEEDS = Number(END_BATCH - START_BATCH) * SEEDS_PER_BATCH; // 3,001,250

/** Hits kept in the list. The engine can out-run the DOM on a loose filter. */
const MAX_HITS = 80;

/** How often the engine reports progress. ~7 ticks/second reads as live. */
const PROGRESS_INTERVAL_MS = 150n;

export type SeedSearchPhase = "idle" | "booting" | "searching" | "done" | "cancelled" | "error";

export type SeedSearchStats = {
  seedsSearched: number;
  matchingSeeds: number;
  /** 0-1. */
  percentComplete: number;
  seedsPerSecond: number;
  elapsedMs: number;
};

const ZERO_STATS: SeedSearchStats = {
  seedsSearched: 0,
  matchingSeeds: 0,
  percentComplete: 0,
  seedsPerSecond: 0,
  elapsedMs: 0,
};

/**
 * Drives one Motely search over `jaml` and streams what it finds.
 *
 * Both panes in this file want the same thing — boot, subscribe, sweep a batch
 * window, stream hits, tear down whatever happens — so they share this rather
 * than keeping two copies of the sequence that drift apart.
 */
function useSeedSearch(jaml: string) {
  const [phase, setPhase] = useState<SeedSearchPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<SeedHit[]>([]);
  const [tallyLabels, setTallyLabels] = useState<readonly string[]>([]);
  const [stats, setStats] = useState<SeedSearchStats>(ZERO_STATS);

  /*
   * The live run, in a ref rather than state: stop() and the unmount cleanup
   * have to see the token that exists *now*, not the one captured when the
   * callback was last rebuilt.
   */
  const runRef = useRef<CancellationToken | null>(null);

  const stop = useCallback(() => {
    runRef.current?.cancel();
  }, []);

  /*
   * Unmounting mid-search used to leave the sweep burning wasm cycles with
   * handlers still attached to the global events. Cancel it on the way out.
   */
  useEffect(() => {
    return () => {
      runRef.current?.cancel();
    };
  }, []);

  const start = useCallback(async () => {
    if (runRef.current) return;

    // The engine's own token: stop() cancels the running search directly.
    const token = new CancellationToken();
    runRef.current = token;

    setError(null);
    setHits([]);
    setTallyLabels([]);
    setStats(ZERO_STATS);
    setPhase("booting");

    const onHit = (seed: string, score: number, tallies: readonly number[]) => {
      setHits((prev) => [{ seed, score, tallies }, ...prev].slice(0, MAX_HITS));
    };
    const onProgress = (p: MotelyProgress) => {
      setStats({
        seedsSearched: Number(p.seedsSearched),
        matchingSeeds: Number(p.matchingSeeds),
        percentComplete: p.percentComplete,
        seedsPerSecond: p.seedsPerMillisecond * 1000,
        elapsedMs: Number(p.elapsedMilliseconds),
      });
    };

    try {
      if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
      if (token.isCancellationRequested) {
        setPhase("cancelled");
        return;
      }

      setPhase("searching");
      const config = JamlConfigLoader.fromJaml(jaml);
      setTallyLabels(tallyLabelsFor(config));
      const settings = JamlSearchBuilder.createSettings(config)
        .withThreadCount(1)
        .withQuietMode(true)
        .withSequentialSearch()
        .withBatchCharacterCount(BATCH_CHARS)
        .withStartBatchIndex(START_BATCH)
        .withEndBatchIndex(END_BATCH)
        .withProgressCallback(onProgress)
        .withProgressReportIntervalMs(PROGRESS_INTERVAL_MS);
      // A scored filter reports every find on the scored channel (and the bare seed on the
      // match channel too): listen to exactly one, or each hit lands twice.
      if (settings.seedScoreDesc != null)
        settings.withScoredResultCallback((r: MotelyScoredSeedResult) => onHit(r.seed, r.score, Array.from(r.tallies)));
      else settings.withSeedMatchCallback((seed: string) => onHit(seed, 1, []));

      const search = settings.start(token);
      await search.waitForCompletionAsync();

      /*
       * Cancelling crosses back as a thrown OperationCanceledException on some
       * paths and a clean return on others, so "was it cancelled" is answered
       * by the token in both places, never by which one happened.
       */
      if (token.isCancellationRequested) {
        setPhase("cancelled");
        return;
      }

      // Final totals come off the search, not the last progress tick, which
      // lands before the closing batch is counted.
      setStats({
        seedsSearched: Number(search.totalSeedsSearched),
        matchingSeeds: Number(search.matchingSeeds),
        percentComplete: 1,
        seedsPerSecond: search.seedsPerSecond,
        elapsedMs: Number(search.elapsedMs),
      });
      setPhase("done");
    } catch (e) {
      if (token.isCancellationRequested) {
        setPhase("cancelled");
        return;
      }
      // NativeAOT hands the exception over without its message; the engine keeps it.
      setError(Errors.last() ?? (e instanceof Error ? e.message : String(e)));
      setPhase("error");
    } finally {
      if (runRef.current === token) runRef.current = null;
    }
  }, [jaml]);

  const running = phase === "booting" || phase === "searching";
  return { phase, running, error, hits, tallyLabels, stats, start, stop };
}

const integer = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

/** "3,001,250 seeds · 41% · 1,204,000/s". Progress in the units of the job. */
function describeProgress(phase: SeedSearchPhase, stats: SeedSearchStats, hitCount: number): string {
  if (phase === "idle") {
    return `sequential sweep · batches [${START_BATCH}, ${END_BATCH}) · ${integer.format(WINDOW_SEEDS)} seeds`;
  }
  if (phase === "booting") return "booting motely-wasm…";

  const parts = [`${integer.format(stats.seedsSearched)} seeds`];
  if (stats.percentComplete > 0) parts.push(`${Math.round(stats.percentComplete * 100)}%`);
  if (stats.seedsPerSecond > 0) parts.push(`${integer.format(stats.seedsPerSecond)}/s`);
  parts.push(`${hitCount} ${hitCount === 1 ? "hit" : "hits"}`);
  return parts.join(" · ");
}

export function LiveJamlIde({ defaultJaml = STARTER_JAML }: { defaultJaml?: string }) {
  const [jaml, setJaml] = useState(defaultJaml);
  const { running, error, hits, tallyLabels, stats, phase, start } = useSeedSearch(jaml);

  return (
    <JamlIde
      jaml={jaml}
      onChange={setJaml}
      onSearch={() => void start()}
      isSearching={running}
      showLoadFileButton
      searchResults={hits.map((h) => ({
        seed: h.seed,
        score: h.score,
        tallyColumns: [...h.tallies],
        tallyLabels: [...tallyLabels],
      }))}
      subtitle={error ?? (running ? describeProgress(phase, stats, hits.length) : undefined)}
    />
  );
}

export function SeedLab({ defaultJaml = STARTER_JAML }: { defaultJaml?: string }) {
  const [jaml, setJaml] = useState(defaultJaml);
  const [selected, setSelected] = useState<string | null>(null);
  const { phase, running, error, hits, tallyLabels, stats, start, stop } = useSeedSearch(jaml);

  const statusLabel =
    phase === "booting"
      ? "Booting"
      : phase === "searching"
        ? "Searching…"
        : phase === "cancelled"
          ? "Stopped"
          : phase === "error"
            ? "Error"
            : phase === "done"
              ? hits.length
                ? "Done"
                : "No hits"
              : "Ready";

  return (
    <JimboDock
      pyramid={{ filter: "filter", search: "search", results: "results", jamlyze: "jamlyze" }}
      panes={{
        filter: {
          label: "Filter",
          tone: "blue",
          content: (
            <JamlIde jaml={jaml} onChange={setJaml} showLoadFileButton compactHeader />
          ),
        },
        search: {
          label: "Search",
          tone: "green",
          content: (
            <JimboStack gap="md">
              <JimboStatusPill
                status={
                  running
                    ? "running"
                    : phase === "error"
                      ? "error"
                      : phase === "cancelled"
                        ? "paused"
                        : phase === "done"
                          ? "ok"
                          : "idle"
                }
                label={statusLabel}
              />
              {/*
                * Two lines of room, reserved. The progress string changes every
                * tick and the button sits directly under it — without a floor
                * here, a line-wrap would shift the button out from under a
                * cursor already on its way down.
                */}
              <div style={{ minHeight: "2.6em" }}>
                <JimboText size="sm" tone="grey">
                  {describeProgress(phase, stats, hits.length)}
                </JimboText>
                {error ? (
                  <JimboText size="sm" tone="red">
                    {error}
                  </JimboText>
                ) : null}
              </div>
              {/*
                * One primary action, same place whichever way it reads: the
                * button that starts the sweep is the button that stops it.
                */}
              <JimboButton
                tone={running ? "red" : "orange"}
                fullWidth
                onClick={() => (running ? stop() : void start())}
              >
                {running ? "Stop Search" : "Start Search"}
              </JimboButton>
            </JimboStack>
          ),
        },
        results: {
          label: "Results",
          tone: "gold",
          content: (
            <JimboStack gap="sm">
              {hits.length === 0 ? (
                <JimboText size="sm" tone="grey">
                  {running ? "Sweeping…" : "No hits yet. Start a search."}
                </JimboText>
              ) : (
                <SeedHitTable
                  hits={hits}
                  tallyLabels={tallyLabels}
                  selected={selected}
                  onSelect={setSelected}
                />
              )}
            </JimboStack>
          ),
        },
        jamlyze: {
          label: "Jamlyze",
          tone: "purple",
          content: selected ? (
            /*
             * motely-wasm 28 dropped the in-pass Jamlyzer rider, so the pane
             * analyses the picked seed itself, on demand.
             */
            <Jamlyzer jaml={jaml} seeds={[selected]} defaultSelectedSeed={selected} />
          ) : (
            <JimboText size="sm" tone="grey">
              Pick a hit in Results.
            </JimboText>
          ),
        },
      }}
    />
  );
}

/**
 * Results pane: one row per hit — Seed, Score, then one column per should
 * clause's tally, headed by that clause's label. Clicking a row picks it for Jamlyze.
 */
function SeedHitTable({
  hits,
  tallyLabels,
  selected,
  onSelect,
}: {
  hits: readonly SeedHit[];
  tallyLabels: readonly string[];
  selected: string | null;
  onSelect: (seed: string) => void;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--j-white)" }}>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: "left" }}>Seed</th>
            <th scope="col" style={{ textAlign: "right" }}>Score</th>
            {tallyLabels.map((label, i) => (
              <th key={i} scope="col" style={{ textAlign: "right" }}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hits.map((h) => (
            <tr
              key={h.seed}
              tabIndex={0}
              aria-selected={h.seed === selected}
              onClick={() => onSelect(h.seed)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(h.seed);
                }
              }}
              style={{
                cursor: "pointer",
                background: h.seed === selected ? "var(--j-dark-red)" : undefined,
              }}
            >
              <th scope="row" style={{ textAlign: "left", fontFamily: "var(--j-font-code)", color: "var(--j-gold)" }}>
                {h.seed}
              </th>
              <td style={{ textAlign: "right" }}>{h.score}</td>
              {tallyLabels.map((_, i) => (
                <td key={i} style={{ textAlign: "right" }}>
                  {h.tallies[i] ?? 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
