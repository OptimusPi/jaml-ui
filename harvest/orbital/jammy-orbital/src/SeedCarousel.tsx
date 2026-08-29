"use client";

// Excavated from JAMMY (`components/jimbo-ui/Search/SeedOverviewScreen.tsx`).
//
// HONEST NOTE ON "MAGNETIC SNAPPING": it is not in this file, and never was.
// The gesture here is a plain threshold swipe — record touch start, record touch
// end, and if the horizontal delta exceeds 50px, step the index by one. The card
// does not follow your finger, there is no rubber-banding at the ends, and there
// is no velocity or spring. See `radialLayout.ts` + `styles.css` for where the
// snap feel actually comes from (even angular slots + one settle curve).
//
// Kept faithful rather than "improved" on the way out, so what you have is the
// real artifact. If you do want true drag-follow snapping in the MCP app, the
// upgrade path is in the README — this component is a clean place to start from,
// not a finished implementation of the thing you remember.
//
// Decoupled: JAMMY's `buildDriveLobbyPath` import became a `buildShareUrl` prop.

import React, { useState, useCallback, useRef, useEffect } from "react";
import "./styles.css";

const COPY_FEEDBACK_MS = 2000;

/** Horizontal px before a drag counts as a swipe. Below this it's a tap. */
const SWIPE_THRESHOLD_PX = 50;

export interface SeedEntry {
    seed: string;
    deck: string;
    stake: string;
    /** Optional custom display title. */
    title?: string;
}

export interface SeedCarouselProps {
    seeds: SeedEntry[];
    initialSeedIndex?: number;
    onSeedChange?: (seed: string, deck: string, stake: string, index: number) => void;
    onCopy?: (seed: string) => void;
    /** Build the shareable URL for an entry. Return `null` to hide the Share button. */
    buildShareUrl?: (entry: SeedEntry) => string | null;
    /** Small hint line at the very bottom. Defaults to pifreak's Ante 0 easter egg. */
    footerHint?: React.ReactNode;
}

export function SeedCarousel({
    seeds,
    initialSeedIndex = 0,
    onSeedChange,
    onCopy,
    buildShareUrl,
    footerHint = "💡 Find Hieroglyph voucher to unlock Ante 0!",
}: SeedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(initialSeedIndex);
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        },
        [],
    );

    const currentSeed = seeds[currentIndex];

    const goToIndex = useCallback(
        (index: number) => {
            const entry = seeds[index];
            if (!entry) return;
            setCurrentIndex(index);
            onSeedChange?.(entry.seed, entry.deck, entry.stake, index);
        },
        [seeds, onSeedChange],
    );

    // ── Swipe: threshold only, no drag-follow (see file header) ───────────────
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = e.targetTouches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        const start = touchStartX.current;
        const end = touchEndX.current;
        touchStartX.current = null;
        touchEndX.current = null;
        if (start === null || end === null) return;

        const distance = start - end;
        if (distance > SWIPE_THRESHOLD_PX && currentIndex < seeds.length - 1) {
            goToIndex(currentIndex + 1); // swipe left = next
        }
        if (distance < -SWIPE_THRESHOLD_PX && currentIndex > 0) {
            goToIndex(currentIndex - 1); // swipe right = previous
        }
    }, [currentIndex, seeds.length, goToIndex]);

    const flashFeedback = useCallback((set: (v: boolean) => void) => {
        set(true);
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(() => {
            feedbackTimeoutRef.current = null;
            set(false);
        }, COPY_FEEDBACK_MS);
    }, []);

    const handleCopy = useCallback(async () => {
        if (!currentSeed) return;
        try {
            await navigator.clipboard.writeText(currentSeed.seed);
            onCopy?.(currentSeed.seed);
            flashFeedback(setCopied);
        } catch (err) {
            console.error("Failed to copy seed:", err);
        }
    }, [currentSeed, onCopy, flashFeedback]);

    /** Native share sheet when available, clipboard fallback otherwise. */
    const handleShare = useCallback(async () => {
        if (!currentSeed || !buildShareUrl) return;
        const url = buildShareUrl(currentSeed);
        if (!url) return;

        if (!navigator.share) {
            try {
                await navigator.clipboard.writeText(url);
                flashFeedback(setSharing);
            } catch (err) {
                console.error("Failed to copy share URL:", err);
            }
            return;
        }

        try {
            await navigator.share({
                title: `Balatro Seed: ${currentSeed.seed}`,
                text: `${currentSeed.seed} (${currentSeed.deck} / ${currentSeed.stake})`,
                url,
            });
        } catch (err) {
            console.error("Failed to share:", err);
        }
    }, [currentSeed, buildShareUrl, flashFeedback]);

    if (!currentSeed) return null;

    // `jammy-orbital` scopes the stylesheet's utility layer to this subtree;
    // `--carousel` carries this root's own layout, which a descendant selector
    // cannot reach.
    return (
        <div
            className="jammy-orbital jammy-orbital--carousel flex h-full w-full flex-col items-center justify-center p-6 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Dot indicator — the active dot scales up rather than only changing
                color, so position is readable at a glance on a dark backdrop. */}
            {seeds.length > 1 && (
                <div className="mb-4 flex items-center gap-2">
                    {seeds.map((entry, index) => (
                        <div
                            key={`${entry.seed}-${entry.deck}-${entry.stake}`}
                            className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                index === currentIndex ? "scale-125 bg-[#f77f3e] opacity-100" : "bg-white opacity-40"
                            }`}
                        />
                    ))}
                </div>
            )}

            <div className="mb-8 text-center">
                <div className="mb-2 text-xs tracking-[0.2em] text-white uppercase opacity-60">
                    {currentSeed.title || "Balatro Seed"}
                </div>
                <div className="rounded-2xl border-2 border-[#f77f3e]/40 bg-black/20 px-6 py-4 font-mono text-4xl text-[#f77f3e] backdrop-blur-sm">
                    {currentSeed.seed}
                </div>

                {/* Deck blue / stake red — the same two colors the game uses, so
                    the pairing is recognizable without labels once learned. */}
                <div className="mt-3 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white opacity-60">Deck</span>
                        <span className="text-sm font-normal text-[#29b6f6]">{currentSeed.deck}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white opacity-60">Stake</span>
                        <span className="text-sm font-normal text-[#f44336]">{currentSeed.stake}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleCopy}
                    title="Copy seed"
                    className={`flex transform items-center gap-2 rounded-xl px-6 py-3 font-normal text-black transition-all duration-200 hover:scale-105 active:scale-95 ${
                        copied ? "bg-[#4caf50]" : "bg-[#f77f3e]"
                    }`}
                >
                    {copied ? "Copied!" : "Copy Seed"}
                </button>

                {buildShareUrl && (
                    <button
                        onClick={handleShare}
                        title="Share seed link"
                        className={`flex transform items-center gap-2 rounded-xl border-2 border-[#29b6f6] px-6 py-3 font-normal transition-all duration-200 hover:scale-105 active:scale-95 ${
                            sharing ? "bg-[#29b6f6] text-black" : "bg-transparent text-[#29b6f6]"
                        }`}
                    >
                        {sharing ? "Link Copied!" : "Share"}
                    </button>
                )}
            </div>

            {/* Arrows for pointer devices — the swipe is touch-only. */}
            {seeds.length > 1 && (
                <>
                    {currentIndex > 0 && (
                        <button
                            title="Previous seed"
                            aria-label="Previous seed"
                            onClick={() => goToIndex(currentIndex - 1)}
                            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-all duration-200 hover:scale-110"
                        >
                            ‹
                        </button>
                    )}
                    {currentIndex < seeds.length - 1 && (
                        <button
                            title="Next seed"
                            aria-label="Next seed"
                            onClick={() => goToIndex(currentIndex + 1)}
                            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-all duration-200 hover:scale-110"
                        >
                            ›
                        </button>
                    )}
                </>
            )}

            {seeds.length > 1 && (
                <div className="absolute bottom-6 text-xs text-white opacity-40">← Swipe to browse seeds →</div>
            )}

            {footerHint && (
                <div className="absolute bottom-2 text-center text-[10px] text-[#f77f3e] opacity-25">{footerHint}</div>
            )}
        </div>
    );
}
