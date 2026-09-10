"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import bootsharp, {
  Event as MotelyEvent,
  Search,
  type MotelyJamlyzerSeedResult,
  type MotelyProgress,
  type MotelySeedScore,
} from "motely-wasm";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboDock } from "../ui/JimboDock.js";
import { JimboListItem } from "../ui/JimboListItem.js";
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

export type SeedHit = { seed: string; score: number };

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

/*
 * Analysis depth carried by the search itself.
 *
 * withAnalysis(eventRolls) makes the engine run the Jamlyzer on every hit in
 * the same pass and emit the breakdown on Search.onAnalyzed, so the Jamlyze
 * pane never crosses back into wasm for a seed the search already handed us.
 * 20 is the depth Analyze.seeds() uses, so the pane renders exactly what it
 * rendered back when it called Analyze itself.
 */
const ANALYSIS_EVENT_ROLLS = 20;

/** Hits kept in the list. The engine can out-run the DOM on a loose filter. */
const MAX_HITS = 80;

/** How often the engine reports progress. ~7 ticks/second reads as live. */
const PROGRESS_INTERVAL_MS = 150n;

/*
 * Search.onScored / onProgress / onAnalyzed are module-global: one wasm engine,
 * one event bus. Two mounted components running at once would interleave their
 * hits into both lists, so runs are serialised process-wide rather than
 * per-component. Handlers are attached for the length of a run and detached in
 * its finally block, so a component that is not running receives nothing.
 */
let activeRun: SearchCancellation | null = null;

/*
 * motely-wasm 26.0.0 exports no usable CancellationToken at runtime, and
 * TypeScript will not warn you about it.
 *
 * Its root index.mjs star-exports both bcl/cancellation.mjs (the real class)
 * and generated/modules/index.g.mjs (an internal marshalling shim that happens
 * to reuse the name). A name exported ambiguously by two `export *` clauses is
 * excluded from the ES module namespace, so `CancellationToken` imports as
 * undefined — while tsc resolves the type to the class and reports nothing.
 * `new CancellationToken()` compiles clean, then throws "CancellationToken is
 * not a constructor" in the browser. Verified against 26.0.0: the root
 * namespace has CancellationToken === undefined, Event === class.
 *
 * settings.start() marshals a token by subscribing to onCancellationRequested
 * and reading isCancellationRequested, so that shape — built on Event, which
 * *is* exported unambiguously — is the whole contract.
 *
 * Delete this in favour of the real import once upstream disambiguates.
 */
class SearchCancellation {
  readonly onCancellationRequested = new MotelyEvent<[]>();
  private cancelled = false;

  get isCancellationRequested() {
    return this.cancelled;
  }

  cancel() {
    if (this.cancelled) return;
    this.cancelled = true;
    this.onCancellationRequested.broadcast();
  }
}

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

const NO_ANALYSES: ReadonlyMap<string, MotelyJamlyzerSeedResult> = new Map();

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
  const [analyses, setAnalyses] = useState<ReadonlyMap<string, MotelyJamlyzerSeedResult>>(NO_ANALYSES);
  const [stats, setStats] = useState<SeedSearchStats>(ZERO_STATS);

  /*
   * The live run, in a ref rather than state: stop() and the unmount cleanup
   * have to see the token that exists *now*, not the one captured when the
   * callback was last rebuilt.
   */
  const runRef = useRef<SearchCancellation | null>(null);

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
    if (activeRun) {
      setError("Another search is already running on this page.");
      setPhase("error");
      return;
    }

    const token = new SearchCancellation();
    runRef.current = token;
    activeRun = token;

    setError(null);
    setHits([]);
    setAnalyses(NO_ANALYSES);
    setStats(ZERO_STATS);
    setPhase("booting");

    const onScored = (r: MotelySeedScore) => {
      setHits((prev) => [{ seed: r.seed, score: r.score }, ...prev].slice(0, MAX_HITS));
    };
    const onAnalyzed = (r: MotelyJamlyzerSeedResult) => {
      setAnalyses((prev) => new Map(prev).set(r.seed, r));
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

    let subscribed = false;
    try {
      if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
      if (token.isCancellationRequested) {
        setPhase("cancelled");
        return;
      }

      Search.onScored.subscribe(onScored);
      Search.onAnalyzed.subscribe(onAnalyzed);
      Search.onProgress.subscribe(onProgress);
      subscribed = true;

      setPhase("searching");
      const settings = Search.settings(jaml)
        .withSequentialSearch()
        .withBatchCharacterCount(BATCH_CHARS)
        .withStartBatchIndex(START_BATCH)
        .withEndBatchIndex(END_BATCH)
        .withAnalysis(ANALYSIS_EVENT_ROLLS)
        .withProgressReportIntervalMs(PROGRESS_INTERVAL_MS);

      await settings.start(token);

      /*
       * Cancelling crosses back as a thrown OperationCanceledException on some
       * paths and a clean return on others, so "was it cancelled" is answered
       * by the token in both places, never by which one happened.
       */
      if (token.isCancellationRequested) {
        setPhase("cancelled");
        return;
      }

      // Final totals come off the settings object, not the last progress tick,
      // which lands before the closing batch is counted.
      setStats({
        seedsSearched: Number(settings.totalSeedsSearched),
        matchingSeeds: Number(settings.matchingSeeds),
        percentComplete: 1,
        seedsPerSecond: settings.seedsPerSecond,
        elapsedMs: Number(settings.elapsedMs),
      });
      setPhase("done");
    } catch (e) {
      if (token.isCancellationRequested) {
        setPhase("cancelled");
        return;
      }
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    } finally {
      if (subscribed) {
        Search.onScored.unsubscribe(onScored);
        Search.onAnalyzed.unsubscribe(onAnalyzed);
        Search.onProgress.unsubscribe(onProgress);
      }
      if (activeRun === token) activeRun = null;
      if (runRef.current === token) runRef.current = null;
    }
  }, [jaml]);

  const running = phase === "booting" || phase === "searching";
  return { phase, running, error, hits, analyses, stats, start, stop };
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
  const { running, error, hits, stats, phase, start } = useSeedSearch(jaml);

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
        tallyColumns: [h.score],
        tallyLabels: ["score"],
      }))}
      subtitle={error ?? (running ? describeProgress(phase, stats, hits.length) : undefined)}
    />
  );
}

export function SeedLab({ defaultJaml = STARTER_JAML }: { defaultJaml?: string }) {
  const [jaml, setJaml] = useState(defaultJaml);
  const [selected, setSelected] = useState<string | null>(null);
  const { phase, running, error, hits, analyses, stats, start, stop } = useSeedSearch(jaml);

  /*
   * Jamlyzer resets its load state whenever this prop changes identity, and
   * progress ticks re-render this component several times a second — so the
   * array has to survive them.
   */
  const selectedAnalysis = selected ? analyses.get(selected) : undefined;
  const analysisResults = useMemo(
    () => (selectedAnalysis ? [selectedAnalysis] : undefined),
    [selectedAnalysis],
  );

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
                hits.map((h) => (
                  <JimboListItem
                    key={h.seed}
                    active={h.seed === selected}
                    onClick={() => setSelected(h.seed)}
                  >
                    {h.seed} · {h.score}
                  </JimboListItem>
                ))
              )}
            </JimboStack>
          ),
        },
        jamlyze: {
          label: "Jamlyze",
          tone: "purple",
          content: selected ? (
            /*
             * results= when the search already analysed this seed in-pass,
             * which skips Jamlyzer's own Analyze.seeds() call entirely. seeds=
             * is the fallback for a selection we have no breakdown for.
             */
            analysisResults ? (
              <Jamlyzer jaml={jaml} results={analysisResults} defaultSelectedSeed={selected} />
            ) : (
              <Jamlyzer jaml={jaml} seeds={[selected]} defaultSelectedSeed={selected} />
            )
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
