"use client";

import { useState, useCallback } from "react";
import { Program as Motely } from "motely-wasm/motely/wasm";
import type { JamlyzerSnapshot } from "motely-wasm/motely/analysis";
import { ensureMotelyReady } from "../lib/motely/runtime.js";

export type AnalyzerStatus = "idle" | "running" | "done" | "error";

/** Total scoop score for a snapshot = sum of every matched clause's score. */
export function snapshotScore(snapshot: JamlyzerSnapshot): number {
    return (snapshot.matches ?? []).reduce((sum, m) => sum + m.score, 0);
}

export function useAnalyzer() {
    const [score, setScore] = useState<number | null>(null);
    const [status, setStatus] = useState<AnalyzerStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [snapshot, setSnapshot] = useState<JamlyzerSnapshot | null>(null);

    const analyze = useCallback((seed: string, jaml: string) => {
        setScore(null);
        setSnapshot(null);
        setStatus("running");
        setError(null);

        void (async () => {
            try {
                await ensureMotelyReady();
                // parseJaml throws on invalid JAML (the engine owns validation).
                const config = Motely.parseJaml(jaml);
                const result = Motely.jamlyzer(seed, config);
                if (result.error) {
                    throw new Error(result.error);
                }
                setSnapshot(result);
                setScore(snapshotScore(result));
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

    return { score, status, error, analyze, clearError, snapshot };
}
