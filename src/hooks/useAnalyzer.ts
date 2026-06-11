"use client";

import { useState, useCallback } from "react";
import { Program as Motely } from "motely-wasm/motely/wasm";
import type { MotelyScoredSeedResult } from "motely-wasm/motely";
import type { JamlyzerSnapshot } from "motely-wasm/motely/analysis";
import { ensureMotelyReady } from "../lib/motely/runtime.js";

export type AnalyzerStatus = "idle" | "running" | "done" | "error";

// motely-wasm 21.1 split the old jamlyzer(config) API in two:
//  - score + tallies against a filter: runSeedListSearch(config with one seed)
//    captured via onScoredResult (tally labels come from createPlan).
//  - the deep per-seed snapshot (antes/shops/packs/rolls): jamlyze(seed, deck,
//    stake) -> JamlyzerSnapshot, which is filter-agnostic.
export function useAnalyzer() {
    const [score, setScore] = useState<number | null>(null);
    const [status, setStatus] = useState<AnalyzerStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [tallyLabels, setTallyLabels] = useState<string[]>([]);
    const [rawAnalysis, setRawAnalysis] = useState<JamlyzerSnapshot | null>(null);

    const analyze = useCallback((seed: string, jaml: string) => {
        setScore(null);
        setTallyLabels([]);
        setRawAnalysis(null);
        setStatus("running");
        setError(null);

        void (async () => {
            try {
                await ensureMotelyReady();
                let config;
                try {
                    config = Motely.fromJaml(jaml);
                } catch (e) {
                    throw new Error(e instanceof Error ? e.message : "Invalid JAML.");
                }
                config.seeds = [seed];
                setTallyLabels(Array.from(Motely.createPlan(config).tallyLabels));

                let scored: MotelyScoredSeedResult | null = null;
                const onScored = (r: MotelyScoredSeedResult) => {
                    if (r.seed === seed) scored = r;
                };
                Motely.onScoredResult.subscribe(onScored);
                try {
                    Motely.runSeedListSearch(config);
                } finally {
                    Motely.onScoredResult.unsubscribe(onScored);
                }
                if (scored) setScore((scored as MotelyScoredSeedResult).score);

                const snapshot = Motely.jamlyze(seed, config.deck, config.stake);
                if (snapshot.error) {
                    throw new Error(snapshot.error);
                }
                setRawAnalysis(snapshot);
                setStatus("done");
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
                setStatus("error");
            }
        })();
    }, []);

    const clearError = useCallback(() => {
        setError(null);
        setStatus((s) => (s === "error" ? "idle" : s));
    }, []);

    return { score, status, error, analyze, clearError, tallyLabels, rawAnalysis };
}
