"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSeedContext, type SeedContext } from "@/lib/jaml/motelyWasm";
import type { AnalyzerShopItem } from "@/components/jimbo-ui/GameCard";
import type { BalatroDeck, BalatroStake } from "@/lib/jaml/balatroRunContext";

const DEFAULT_PULL = 12;

export type ShopStreamState = {
    items: AnalyzerShopItem[];
    streamReady: boolean;
    engineLoading: boolean;
    loadingMore: boolean;
    streamError: string | null;
    pullMore: (count?: number) => void;
};

export function useShopStream(
    seed: string,
    deck: BalatroDeck,
    stake: BalatroStake,
    ante: number,
    initialItems: AnalyzerShopItem[],
): ShopStreamState {
    const [items, setItems] = useState<AnalyzerShopItem[]>(() => initialItems.map(i => ({ ...i })));
    const [streamError, setStreamError] = useState<string | null>(null);
    const [streamReady, setStreamReady] = useState(false);
    const [engineLoading, setEngineLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const ctxRef = useRef<SeedContext | null>(null);
    const genRef = useRef(0);
    const busyRef = useRef(false);

    // Stable signature so the effect doesn't re-run on every render when initialItems is inline
    const initialSig = useMemo(
        () => initialItems.map(i => `${i.id}:${i.name}`).join("|"),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [initialItems],
    );

    useEffect(() => {
        const gen = ++genRef.current;
        const base = initialItems.map(i => ({ ...i }));

        setItems(base);
        setStreamError(null);
        setStreamReady(false);
        setEngineLoading(true);
        setLoadingMore(false);
        ctxRef.current?.dispose();
        ctxRef.current = null;

        createSeedContext(seed, deck, stake)
            .then(ctx => {
                if (gen !== genRef.current) { ctx.dispose(); return; }

                ctx.beginShopStream(ante);
                // Advance past already-visible items so the cursor is in sync
                for (let i = 0; i < base.length; i++) ctx.getNextShopItem();

                if (base.length === 0) {
                    const prefetch: AnalyzerShopItem[] = [];
                    for (let i = 0; i < DEFAULT_PULL; i++) prefetch.push(ctx.getNextShopItem());
                    if (gen !== genRef.current) { ctx.dispose(); return; }
                    setItems(prefetch);
                }

                ctxRef.current = ctx;
                setStreamReady(true);
            })
            .catch(err => {
                if (gen !== genRef.current) return;
                setStreamError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (gen === genRef.current) setEngineLoading(false);
            });

        return () => { ctxRef.current?.dispose(); };
        // initialSig is the stable proxy for initialItems
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed, deck, stake, ante, initialSig]);

    const pullMore = useCallback((count = DEFAULT_PULL) => {
        const ctx = ctxRef.current;
        if (!ctx || count <= 0 || busyRef.current) return;
        busyRef.current = true;
        setLoadingMore(true);
        setStreamError(null);
        try {
            const next: AnalyzerShopItem[] = [];
            for (let i = 0; i < count; i++) next.push(ctx.getNextShopItem());
            setItems(prev => [...prev, ...next]);
        } catch (err) {
            setStreamError(err instanceof Error ? err.message : String(err));
        } finally {
            busyRef.current = false;
            setLoadingMore(false);
        }
    }, []);

    return { items, streamReady, engineLoading, loadingMore, streamError, pullMore };
}
