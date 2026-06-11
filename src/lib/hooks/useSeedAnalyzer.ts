"use client";

import { useState, useEffect } from "react";
import { type Program as MotelyNamespace } from "motely-wasm/motely/wasm";
import type { MotelyScoredSeedResult } from "motely-wasm/motely";
import type { JamlyzerSnapshot } from "motely-wasm/motely/analysis";

type MotelyApi = typeof MotelyNamespace;

/** Per-seed result shape, reassembled from the split motely-wasm 21.1 API
 *  (the old jamlyzer(config) bundled score + analysis per seed). */
export interface SeedAnalyzerResult {
    seed: string;
    score: number;
    tallies: number[];
    analysis: JamlyzerSnapshot;
}

export function useSeedAnalyzer(motely: MotelyApi | null, seed: string | null, jaml?: string) {
    const [data, setData] = useState<SeedAnalyzerResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!seed || seed === "LOCKED" || !motely) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing async-derived data when inputs invalidate
            setData(null);
            return;
        }

        const abortController = new AbortController();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const config = jaml ?? `version: 1\nconfig:\n  deck: Erratic\n  stake: White\n`;
                let parsed;
                try {
                    parsed = motely.fromJaml(config);
                } catch (e) {
                    throw new Error(e instanceof Error ? e.message : "Invalid JAML.");
                }
                if (abortController.signal.aborted) return;

                parsed.seeds = [seed];
                let scored: MotelyScoredSeedResult | null = null;
                const onScored = (r: MotelyScoredSeedResult) => {
                    if (r.seed === seed) scored = r;
                };
                motely.onScoredResult.subscribe(onScored);
                try {
                    motely.runSeedListSearch(parsed);
                } finally {
                    motely.onScoredResult.unsubscribe(onScored);
                }

                const snapshot = motely.jamlyze(seed, parsed.deck, parsed.stake);
                if (abortController.signal.aborted) return;
                if (snapshot.error) {
                    throw new Error(snapshot.error);
                }
                const hit = scored as MotelyScoredSeedResult | null;
                setData({
                    seed,
                    score: hit?.score ?? 0,
                    tallies: hit ? Array.from(hit.tallies) : [],
                    analysis: snapshot,
                });
            } catch (err) {
                if (abortController.signal.aborted) return;
                console.error("[useSeedAnalyzer] Analysis error:", err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                if (!abortController.signal.aborted) setLoading(false);
            }
        })();

        return () => abortController.abort();
    }, [motely, seed, jaml]);

    return { data, loading, error };
}
