"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { JimboColorOption } from "@/lib/jimbo-ui/types";
import {
    analysisRunKey,
    normalizeDeckName,
    normalizeStakeName,
    type BalatroDeck,
    type BalatroStake,
} from "@/lib/jaml/balatroRunContext";
import type { SeedAnalysisAnteView, SeedAnalysisView } from "@/lib/jaml/seedAnalysisView";
import { analyzeSeedWasmSafe } from "@/lib/jaml/motelyWasm";
import { ChevronLeft, ChevronRight, Check, ExternalLink } from "lucide-react";

const JimboVoucher = dynamic(() => import("@/components/jimbo-ui").then(mod => ({ default: mod.JimboVoucher })), { ssr: false });
const JimboTag = dynamic(() => import("@/components/jimbo-ui").then(mod => ({ default: mod.JimboTag })), { ssr: false });
const JimboBoss = dynamic(() => import("@/components/jimbo-ui").then(mod => ({ default: mod.JimboBoss })), { ssr: false });
const AnalyzerShopQueueStrip = dynamic(() => import("@/components/jimbo-ui/AnalyzerShopQueueStrip").then(mod => ({ default: mod.AnalyzerShopQueueStrip })), { ssr: false });

const GAME_FONT: React.CSSProperties = { fontFamily: "var(--font-game), monospace", fontWeight: 400 };
const GAME_SHADOW: React.CSSProperties = { textShadow: "1px 1px 0 rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,0.35)" };

export interface SeedPageClientProps {
    seeds: string[];
    initialSeedIndex: number;
    deck: string;
    stake: string;
    jamlFilterLabel?: string | null;
    initialAnalysis: SeedAnalysisView | null;
    initialError: string | null;
}

const STATUS_FEEDBACK_MS = 2000;

type SeedPageViewState = Readonly<{
    selectedIndex: number;
    copyStatus: "idle" | "copied";
    analysisCache: Record<string, SeedAnalysisView>;
    errorCache: Record<string, string>;
}>;

function clampSeedIndex(index: number, seeds: string[]): number {
    return Math.min(Math.max(0, index), Math.max(0, seeds.length - 1));
}

function buildInitialSeedPageState(
    seeds: string[],
    initialSeedIndex: number,
    deck: BalatroDeck,
    stake: BalatroStake,
    initialAnalysis: SeedAnalysisView | null,
    initialError: string | null,
): SeedPageViewState {
    const selectedIndex = clampSeedIndex(initialSeedIndex, seeds);
    const initialSeed = seeds[selectedIndex] ?? seeds[0] ?? "";
    const initialSeedKey = initialSeed ? analysisRunKey(initialSeed, deck, stake) : "";

    return {
        selectedIndex,
        copyStatus: "idle",
        analysisCache: initialAnalysis && initialSeedKey ? { [initialSeedKey]: initialAnalysis } : {},
        errorCache: initialError && initialSeedKey ? { [initialSeedKey]: initialError } : {},
    };
}

export function SeedPageClient(props: SeedPageClientProps) {
    const sessionKey = `${props.deck}::${props.stake}::${props.initialSeedIndex}::${props.seeds.join(",")}`;
    return <SeedPageClientView key={sessionKey} {...props} />;
}

function SeedPageClientView({
    seeds,
    initialSeedIndex,
    deck,
    stake,
    jamlFilterLabel,
    initialAnalysis: initialAnalysisProp,
    initialError: initialErrorProp,
}: SeedPageClientProps) {
    const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const deckNorm: BalatroDeck = normalizeDeckName(deck);
    const stakeNorm: BalatroStake = normalizeStakeName(stake);
    const [state, setState] = useState<SeedPageViewState>(() =>
        buildInitialSeedPageState(seeds, initialSeedIndex, deckNorm, stakeNorm, initialAnalysisProp, initialErrorProp),
    );
    const selectedIndex = clampSeedIndex(state.selectedIndex, seeds);
    const initialSelectedIndex = clampSeedIndex(initialSeedIndex, seeds);
    const initialSeed = seeds[initialSelectedIndex] ?? seeds[0] ?? "";
    const initialSeedKey = initialSeed ? analysisRunKey(initialSeed, deckNorm, stakeNorm) : "";

    const activeSeed = seeds[selectedIndex] ?? seeds[0] ?? "";
    const activeSeedKey = activeSeed ? analysisRunKey(activeSeed, deckNorm, stakeNorm) : "";

    const analysis =
        activeSeedKey === initialSeedKey && initialAnalysisProp !== null
            ? initialAnalysisProp
            : activeSeedKey && Object.hasOwn(state.analysisCache, activeSeedKey)
                ? state.analysisCache[activeSeedKey]!
                : null;
    const error =
        activeSeedKey === initialSeedKey && initialErrorProp !== null
            ? initialErrorProp
            : activeSeedKey && Object.hasOwn(state.errorCache, activeSeedKey)
                ? state.errorCache[activeSeedKey]!
                : null;
    const loading = initialAnalysisProp === null && initialErrorProp === null && Boolean(activeSeed) && analysis === null && error === null;

    useEffect(() => {
        return () => {
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!activeSeed) return;
        if (analysis !== null || error !== null) return;

        let cancelled = false;
        analyzeSeedWasmSafe(activeSeed, deckNorm, stakeNorm).then(({ analysis: view, error: analyzeError }) => {
            if (cancelled) return;
            if (view) {
                setState((prev) => {
                    const nextErrorCache = { ...prev.errorCache };
                    delete nextErrorCache[activeSeedKey];
                    return {
                        ...prev,
                        analysisCache: { ...prev.analysisCache, [activeSeedKey]: view },
                        errorCache: nextErrorCache,
                    };
                });
                return;
            }
            setState((prev) => ({
                ...prev,
                errorCache: { ...prev.errorCache, [activeSeedKey]: analyzeError ?? "Analysis failed. Try opening in Seed Finder." },
            }));
        });

        return () => { cancelled = true; };
    }, [activeSeed, activeSeedKey, analysis, deckNorm, error, stakeNorm]);

    const onPickSeedIndex = useCallback((i: number) => {
        setState((prev) => ({ ...prev, selectedIndex: clampSeedIndex(i, seeds) }));
    }, [seeds]);

    const handleCopySeed = async () => {
        if (!activeSeed) return;
        try {
            await navigator.clipboard.writeText(activeSeed);
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
            setState((prev) => ({ ...prev, copyStatus: "copied" }));
            statusTimeoutRef.current = setTimeout(() => {
                statusTimeoutRef.current = null;
                setState((prev) => ({ ...prev, copyStatus: "idle" }));
            }, STATUS_FEEDBACK_MS);
        } catch { /* clipboard denied */ }
    };

    return (
        <div className="min-h-screen px-2 py-3 sm:px-6 sm:py-6" style={{ backgroundColor: "#0a0a0a" }}>
            <div className="mx-auto max-w-3xl">
                {/* === TOP BAR: seed nav row === */}
                <div className="mb-2 flex items-center gap-1.5">
                    {seeds.length > 1 ? (
                        <button
                            type="button"
                            onClick={() => onPickSeedIndex(selectedIndex - 1)}
                            disabled={selectedIndex <= 0}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-20"
                            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                            aria-label="Previous seed"
                        >
                            <ChevronLeft className="h-4 w-4 text-white" />
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleCopySeed}
                        className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 transition-colors active:scale-[0.98]"
                        style={{ backgroundColor: state.copyStatus === "copied" ? "rgba(66,159,121,0.25)" : "rgba(255,255,255,0.06)" }}
                        title="Tap to copy seed"
                    >
                        {state.copyStatus === "copied" ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-[#429f79]" />
                        ) : null}
                        <span
                            className="truncate text-lg tracking-widest"
                            style={{
                                ...GAME_FONT,
                                ...GAME_SHADOW,
                                color: state.copyStatus === "copied" ? "#429f79" : JimboColorOption.ORANGE,
                            }}
                        >
                            {activeSeed}
                        </span>
                        {seeds.length > 1 ? (
                            <span className="shrink-0 text-sm text-white/40" style={GAME_FONT}>
                                {selectedIndex + 1}/{seeds.length}
                            </span>
                        ) : null}
                    </button>

                    {seeds.length > 1 ? (
                        <button
                            type="button"
                            onClick={() => onPickSeedIndex(selectedIndex + 1)}
                            disabled={selectedIndex >= seeds.length - 1}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-20"
                            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                            aria-label="Next seed"
                        >
                            <ChevronRight className="h-4 w-4 text-white" />
                        </button>
                    ) : null}
                </div>

                {/* Deck / Stake / Filter labels */}
                <div className="mb-3 flex items-center justify-center gap-3 text-sm" style={GAME_FONT}>
                    <span>
                        <span className="text-white/40">Deck </span>
                        <span style={{ color: JimboColorOption.RED, ...GAME_SHADOW }}>{deckNorm}</span>
                    </span>
                    <span>
                        <span className="text-white/40">Stake </span>
                        <span style={{ ...GAME_SHADOW, color: JimboColorOption.WHITE }}>{stakeNorm}</span>
                    </span>
                    {jamlFilterLabel ? (
                        <span className="text-white/30">Filter: {jamlFilterLabel}</span>
                    ) : null}
                </div>

                {/* Multi-seed carousel (only when many seeds) */}
                {seeds.length > 5 ? (
                    <div className="mb-3">
                        <SeedHandCarousel seeds={seeds} selectedIndex={selectedIndex} onSelectIndex={onPickSeedIndex} />
                    </div>
                ) : null}

                {/* === ANALYSIS CONTENT === */}
                {error ? (
                    <div className="rounded-lg p-6 text-center" style={{ backgroundColor: "rgba(255,76,64,0.08)" }}>
                        <p className="text-sm" style={{ ...GAME_FONT, color: JimboColorOption.RED }}>{error}</p>
                    </div>
                ) : analysis ? (
                    <div className="flex flex-col gap-2">
                        {analysis.antes.map((ante) => (
                            <AnteVisualization key={ante.ante} ante={ante} seed={activeSeed} deck={deckNorm} stake={stakeNorm} />
                        ))}
                    </div>
                ) : loading ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-3">
                        <div
                            className="h-10 w-10 animate-spin rounded-full border-3 border-t-transparent"
                            style={{ borderColor: JimboColorOption.RED, borderTopColor: "transparent" }}
                        />
                        <span className="animate-pulse text-sm text-white/40" style={GAME_FONT}>
                            Loading {activeSeed}...
                        </span>
                    </div>
                ) : null}

                {/* Footer */}
                <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between text-sm text-white/30" style={GAME_FONT}>
                        <span>Powered by Motely WASM</span>
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-white/40 transition-opacity hover:text-white/70"
                        >
                            <ExternalLink size={10} />
                            Seed Finder
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Horizontal "hand" of seed chips for large seed lists. */
function SeedHandCarousel({
    seeds,
    selectedIndex,
    onSelectIndex,
}: {
    seeds: string[];
    selectedIndex: number;
    onSelectIndex: (i: number) => void;
}) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "center",
        containScroll: "trimSnaps",
        loop: false,
    });

    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => onSelectIndex(emblaApi.selectedScrollSnap());
        emblaApi.on("select", onSelect);
        onSelect();
        return () => { emblaApi.off("select", onSelect); };
    }, [emblaApi, onSelectIndex]);

    useEffect(() => { emblaApi?.scrollTo(selectedIndex, true); }, [selectedIndex, emblaApi]);
    useEffect(() => { emblaApi?.reInit(); }, [seeds, emblaApi]);

    return (
        <div className="relative rounded-md bg-black/20 py-2 px-1" style={{ overscrollBehaviorX: "contain" }}>
            <div ref={emblaRef} className="overflow-hidden" style={{ touchAction: "pan-x" }}>
                <div className="flex items-stretch">
                    {seeds.map((s, i) => {
                        const on = i === selectedIndex;
                        return (
                            <div key={`${s}-${i}`} className="flex min-w-0 shrink-0 grow-0 pl-1" style={{ flex: "0 0 min(30vw, 7rem)" }}>
                                <button
                                    type="button"
                                    onClick={() => onSelectIndex(i)}
                                    className="flex w-full flex-col items-center justify-center rounded-md px-1 py-1.5 transition-transform active:scale-[0.98]"
                                    style={{
                                        backgroundColor: on ? "rgba(247,127,62,0.12)" : "rgba(255,255,255,0.04)",
                                        border: on ? `1px solid ${JimboColorOption.ORANGE}` : "1px solid transparent",
                                        ...GAME_FONT,
                                    }}
                                >
                                    <span className="text-[11px] uppercase text-white/35" style={GAME_FONT}>#{i + 1}</span>
                                    <span className="mt-0.5 break-all text-center text-sm tracking-widest text-white" style={{ ...GAME_FONT, ...GAME_SHADOW }}>
                                        {s}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function AnteVisualization({
    ante,
    seed,
    deck,
    stake,
}: Readonly<{ ante: SeedAnalysisAnteView; seed: string; deck: BalatroDeck; stake: BalatroStake }>) {
    return (
        <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
            {/* Ante header row */}
            <div className="mb-2 flex items-center gap-3">
                <div className="flex shrink-0 flex-col items-center rounded-md bg-black/20 px-3 py-1.5">
                    <span className="text-[11px] uppercase text-white/40" style={GAME_FONT}>Ante</span>
                    <span className="text-3xl leading-none text-white italic" style={GAME_SHADOW}>{ante.ante}</span>
                </div>

                {ante.voucher ? (
                    <div className="flex shrink-0 flex-col items-center gap-0.5">
                        <JimboVoucher voucherName={ante.voucher} scale={0.6} />
                        <span className="max-w-[84px] text-center text-[11px] leading-tight text-white" style={{ ...GAME_FONT, ...GAME_SHADOW }}>
                            {ante.voucher}
                        </span>
                    </div>
                ) : null}

                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <JimboBoss bossName={ante.boss} scale={1} />
                    <div className="min-w-0">
                        <span className="block text-[11px] uppercase" style={{ color: JimboColorOption.RED, ...GAME_FONT }}>Boss</span>
                        <span className="block truncate text-sm uppercase text-white" style={{ ...GAME_FONT, ...GAME_SHADOW }}>
                            {ante.boss}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tags */}
            {(ante.smallBlindTag || ante.bigBlindTag) ? (
                <div className="mb-2 flex gap-2">
                    {ante.smallBlindTag ? (
                        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1">
                            <JimboTag tagName={ante.smallBlindTag} scale={0.7} />
                            <div>
                                <span className="block text-[11px] uppercase text-white/40" style={GAME_FONT}>Small</span>
                                <span className="text-sm uppercase text-white" style={{ ...GAME_FONT, ...GAME_SHADOW }}>{ante.smallBlindTag}</span>
                            </div>
                        </div>
                    ) : null}
                    {ante.bigBlindTag ? (
                        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1">
                            <JimboTag tagName={ante.bigBlindTag} scale={0.7} />
                            <div>
                                <span className="block text-[11px] uppercase text-white/40" style={GAME_FONT}>Big</span>
                                <span className="text-sm uppercase text-white" style={{ ...GAME_FONT, ...GAME_SHADOW }}>{ante.bigBlindTag}</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {/* Shop queue */}
            <div>
                <div className="mb-1 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: JimboColorOption.ORANGE }} />
                    <span className="text-[11px] text-white/40" style={GAME_FONT}>Shop Queue</span>
                </div>
                <Suspense fallback={<div className="text-[11px] text-white/30" style={GAME_FONT}>Loading shop...</div>}>
                    <AnalyzerShopQueueStrip seed={seed} deck={deck} stake={stake} ante={ante.ante} initialItems={ante.shopQueue} variant="expanded" />
                </Suspense>
            </div>
        </div>
    );
}
