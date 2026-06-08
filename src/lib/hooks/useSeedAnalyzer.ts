"use client";

import { useState, useEffect } from "react";
import { type Program as MotelyNamespace } from "motely-wasm/motely/wasm";
import type { JamlyzerSnapshot } from "motely-wasm/motely/analysis";

type MotelyApi = typeof MotelyNamespace;

export function useSeedAnalyzer(motely: MotelyApi | null, seed: string | null, jaml?: string) {
    const [data, setData] = useState<JamlyzerSnapshot | null>(null);
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
                // parseJaml throws on invalid JAML (the engine owns validation).
                const lens = motely.parseJaml(config);
                if (abortController.signal.aborted) return;

                const result = motely.jamlyzer(seed, lens);
                if (abortController.signal.aborted) return;
                if (result.error) {
                    throw new Error(result.error);
                }
                setData(result);
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
