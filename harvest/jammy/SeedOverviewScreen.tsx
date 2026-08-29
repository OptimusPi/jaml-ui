"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { buildDriveLobbyPath } from "@/lib/drive/seedSharePaths";
import { Copy, Check, Share, ChevronLeft, ChevronRight } from "lucide-react";

const COPY_FEEDBACK_MS = 2000;

interface SeedOverviewScreenProps {
    seeds: Array<{
        seed: string;
        deck: string;
        stake: string;
        title?: string; // Optional custom display title
    }>;
    initialSeedIndex?: number;
    onSeedChange: (seed: string, deck: string, stake: string, index: number) => void;
    onCopy: (seed: string) => void;
}

export function SeedOverviewScreen({ seeds, initialSeedIndex = 0, onSeedChange, onCopy }: SeedOverviewScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(initialSeedIndex);
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timeout on unmount
    useEffect(
        () => () => {
            if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        },
        [],
    );

    const currentSeed = seeds[currentIndex];

    // Handle swipe navigation
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
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentIndex < seeds.length - 1) {
            // Swipe left = next seed
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            const nextSeed = seeds[nextIndex];
            onSeedChange(nextSeed.seed, nextSeed.deck, nextSeed.stake, nextIndex);
        }

        if (isRightSwipe && currentIndex > 0) {
            // Swipe right = previous seed
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            const prevSeed = seeds[prevIndex];
            onSeedChange(prevSeed.seed, prevSeed.deck, prevSeed.stake, prevIndex);
        }
    }, [currentIndex, seeds, onSeedChange]);

    // Copy seed to clipboard
    const handleCopy = useCallback(async () => {
        if (!currentSeed) return;
        try {
            await navigator.clipboard.writeText(currentSeed.seed);
            setCopied(true);
            onCopy(currentSeed.seed);
            if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = setTimeout(() => {
                feedbackTimeoutRef.current = null;
                setCopied(false);
            }, COPY_FEEDBACK_MS);
        } catch (err) {
            console.error("Failed to copy seed:", err);
        }
    }, [currentSeed, onCopy]);

    // Share seed link
    const handleShare = useCallback(async () => {
        if (!currentSeed) return;

        const origin = typeof location !== "undefined" ? location.origin : "";
        if (!origin) return;
        const url = `${origin}${buildDriveLobbyPath(currentSeed.seed, currentSeed.deck, currentSeed.stake)}`;

        if (!navigator.share) {
            try {
                await navigator.clipboard.writeText(url);
                setSharing(true);
                if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
                feedbackTimeoutRef.current = setTimeout(() => {
                    feedbackTimeoutRef.current = null;
                    setSharing(false);
                }, COPY_FEEDBACK_MS);
            } catch (err) {
                console.error("Failed to copy share URL:", err);
            }
            return;
        }

        try {
            await navigator.share({
                title: `Balatro Seed: ${currentSeed.seed}`,
                text: `3D drive lobby — ${currentSeed.seed} (${currentSeed.deck} / ${currentSeed.stake})`,
                url: url,
            });
        } catch (err) {
            console.error("Failed to share:", err);
        }
    }, [currentSeed]);

    if (!currentSeed) return null;

    return (
        <div
            className="flex h-full w-full flex-col items-center justify-center p-6 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Seed counter indicator */}
            {seeds.length > 1 && (
                <div className="mb-4 flex items-center gap-2">
                    {seeds.map((seedEntry, index) => (
                        <div
                            key={`${seedEntry.seed}-${seedEntry.deck}-${seedEntry.stake}`}
                            className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                index === currentIndex ? "scale-125 bg-[#f77f3e] opacity-100" : "bg-white opacity-40"
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Seed display */}
            <div className="mb-8 text-center">
                <div className="mb-2 text-xs tracking-[0.2em] text-white uppercase opacity-60">{currentSeed.title || "Balatro Seed"}</div>
                <div className="rounded-2xl border-2 border-[#f77f3e]/40 bg-black/20 px-6 py-4 font-mono text-4xl text-[#f77f3e] backdrop-blur-sm">
                    {currentSeed.seed}
                </div>

                {/* Deck & Stake info */}
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

            {/* Action buttons */}
            <div className="flex items-center gap-4">
                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    title="Copy seed"
                    className={`flex transform items-center gap-2 rounded-xl px-6 py-3 font-normal text-black transition-all duration-200 hover:scale-105 active:scale-95 ${copied ? "bg-[#4caf50]" : "bg-[#f77f3e]"}`}
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Seed"}
                </button>

                {/* Share button */}
                <button
                    onClick={handleShare}
                    title="Share seed link"
                    className={`flex transform items-center gap-2 rounded-xl border-2 border-[#29b6f6] px-6 py-3 font-normal transition-all duration-200 hover:scale-105 active:scale-95 ${sharing ? "bg-[#29b6f6] text-black" : "bg-transparent text-[#29b6f6]"}`}
                >
                    <Share className="h-4 w-4" />
                    {sharing ? "Link Copied!" : "Share"}
                </button>
            </div>

            {/* Navigation arrows for non-touch devices */}
            {seeds.length > 1 && (
                <>
                    {currentIndex > 0 && (
                        <button
                            title="Previous seed"
                            onClick={() => {
                                const prevIndex = currentIndex - 1;
                                setCurrentIndex(prevIndex);
                                const prevSeed = seeds[prevIndex];
                                onSeedChange(prevSeed.seed, prevSeed.deck, prevSeed.stake, prevIndex);
                            }}
                            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/20 p-3 transition-all duration-200 hover:scale-110"
                        >
                            <ChevronLeft className="h-5 w-5 text-white" />
                        </button>
                    )}

                    {currentIndex < seeds.length - 1 && (
                        <button
                            title="Next seed"
                            onClick={() => {
                                const nextIndex = currentIndex + 1;
                                setCurrentIndex(nextIndex);
                                const nextSeed = seeds[nextIndex];
                                onSeedChange(nextSeed.seed, nextSeed.deck, nextSeed.stake, nextIndex);
                            }}
                            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/20 p-3 transition-all duration-200 hover:scale-110"
                        >
                            <ChevronRight className="h-5 w-5 text-white" />
                        </button>
                    )}
                </>
            )}

            {/* Swipe instruction (subtle) */}
            {seeds.length > 1 && <div className="absolute bottom-6 text-xs text-white opacity-40">← Swipe to browse seeds →</div>}

            {/* PIFREAK's Ante 0 Easter Egg hint! */}
            <div className="absolute bottom-2 text-center text-[10px] text-[#f77f3e] opacity-25">
                💡 Find Hieroglyph voucher to unlock Ante 0!
            </div>
        </div>
    );
}
