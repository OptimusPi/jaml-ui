"use client";

import React, { useCallback, useRef, useState } from "react";
import { JimboInnerPanel } from "./Panel";
import { JimboGameCard, JimboVoucher, resolveAnalyzerShopItem, type AnalyzerShopItem } from "./GameCard";
import { JimboColorOption } from "@/lib/jimbo-ui/types";
import { useShopStream } from "./hooks/useShopStream";
import type { BalatroDeck, BalatroStake } from "@/lib/jaml/balatroRunContext";

type AnalyzerShopQueueStripProps = Readonly<{
    seed: string;
    deck: BalatroDeck;
    stake: BalatroStake;
    ante: number;
    initialItems: AnalyzerShopItem[];
    variant: "compact" | "expanded";
}>;

const SCROLL_BUFFER_PX = 280;
const SCROLL_STEP_PX = 260;

export function AnalyzerShopQueueStrip({ seed, deck, stake, ante, initialItems, variant }: AnalyzerShopQueueStripProps) {
    const { items, streamReady, engineLoading, loadingMore, streamError, pullMore } = useShopStream(seed, deck, stake, ante, initialItems);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef<{ pointerId: number | null; startX: number; startScrollLeft: number }>({
        pointerId: null,
        startX: 0,
        startScrollLeft: 0,
    });
    const [isDragging, setIsDragging] = useState(false);


    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        if (!streamReady || engineLoading || loadingMore) return;
        if (target.scrollWidth - (target.scrollLeft + target.clientWidth) <= SCROLL_BUFFER_PX) {
            pullMore();
        }
    }, [engineLoading, loadingMore, pullMore, streamReady]);

    const stopDragging = useCallback(() => {
        dragStateRef.current.pointerId = null;
        setIsDragging(false);
    }, []);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        const target = event.currentTarget;
        dragStateRef.current.pointerId = event.pointerId;
        dragStateRef.current.startX = event.clientX;
        dragStateRef.current.startScrollLeft = target.scrollLeft;
        target.setPointerCapture(event.pointerId);
        setIsDragging(true);
    }, []);

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || dragStateRef.current.pointerId !== event.pointerId) return;
        const target = event.currentTarget;
        const delta = event.clientX - dragStateRef.current.startX;
        target.scrollLeft = dragStateRef.current.startScrollLeft - delta;
    }, [isDragging]);

    const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (dragStateRef.current.pointerId !== event.pointerId) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        stopDragging();
    }, [stopDragging]);

    const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        if (target.scrollWidth <= target.clientWidth) return;

        const useHorizontalFromVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
        const delta = useHorizontalFromVertical ? event.deltaY : event.deltaX;
        if (delta === 0) return;

        target.scrollLeft += delta;
        event.preventDefault();
    }, []);

    const handleNudge = useCallback((direction: -1 | 1) => {
        const target = scrollerRef.current;
        if (!target) return;
        target.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: "smooth" });
        if (direction > 0 && target.scrollWidth - (target.scrollLeft + target.clientWidth) <= SCROLL_BUFFER_PX * 2) {
            pullMore();
        }
    }, [pullMore]);

    const cardScale = 0.7;
    const CARD_LABEL: React.CSSProperties = {
        fontFamily: "var(--font-game), monospace",
        color: "#ffffff",
        textShadow: "1px 1px 0 rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,0.35)",
    };

    return (
        <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase text-white/35" style={{ fontFamily: "var(--font-game), monospace" }}>Drag or scroll to pull more</span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        aria-label="Scroll shop queue left"
                        onClick={() => handleNudge(-1)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-xs text-white/60 transition-colors hover:bg-white/10"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        aria-label="Scroll shop queue right"
                        onClick={() => handleNudge(1)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-xs text-white/60 transition-colors hover:bg-white/10"
                    >
                        →
                    </button>
                </div>
            </div>
            <div
                ref={scrollerRef}
                className={
                    variant === "compact"
                        ? `jammy-scrollbar flex flex-nowrap gap-2 overflow-x-auto overflow-y-visible overscroll-x-contain py-1 pb-3 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`
                        : `jammy-scrollbar flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain py-1 pb-3 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`
                }
                style={{ touchAction: "pan-y" }}
                onScroll={handleScroll}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={stopDragging}
                onWheel={handleWheel}
            >
            {items.map((item, index) => {
                const resolved = resolveAnalyzerShopItem(item, cardScale);
                if (variant === "compact") {
                    return (
                        <div
                            key={`${item.id}-${item.name}-${index}`}
                            className="group flex shrink-0 flex-col items-center"
                            style={{ width: `${71 * cardScale + 8}px` }}
                        >
                            {resolved.kind === "voucher" ? (
                                <JimboVoucher voucherName={resolved.voucherName} scale={cardScale} />
                            ) : resolved.kind === "unknown" ? (
                                <div
                                    className="flex items-center justify-center rounded text-center text-[8px] uppercase"
                                    style={{ width: `${71 * cardScale}px`, ...CARD_LABEL, opacity: 0.55 }}
                                >
                                    {resolved.label}
                                </div>
                            ) : (
                                <JimboGameCard card={resolved.card} type={resolved.type} />
                            )}
                            <span
                                className="line-clamp-2 max-w-[72px] text-center text-[9px] uppercase leading-tight"
                                style={{ ...CARD_LABEL, paddingTop: "4px" }}
                            >
                                {item.name}
                            </span>
                        </div>
                    );
                }

                return (
                    <div
                        key={`${item.id}-${item.name}-${index}`}
                        className="flex shrink-0 flex-col items-center"
                        style={{ width: `${71 * cardScale + 12}px` }}
                    >
                        {resolved.kind === "voucher" ? (
                            <JimboVoucher voucherName={resolved.voucherName} scale={cardScale} />
                        ) : resolved.kind === "unknown" ? (
                            <div
                                className="flex items-center justify-center rounded text-center text-[9px] uppercase"
                                style={{ width: `${71 * cardScale}px`, ...CARD_LABEL, opacity: 0.55 }}
                            >
                                {resolved.label}
                            </div>
                        ) : (
                            <JimboGameCard card={resolved.card} type={resolved.type} />
                        )}
                        <span
                            className="line-clamp-2 max-w-[72px] text-center text-[10px] uppercase leading-tight"
                            style={{ ...CARD_LABEL, paddingTop: "4px" }}
                        >
                            {item.name}
                        </span>
                    </div>
                );
            })}
            {(engineLoading || loadingMore) ? (
                <div className="flex w-[60px] shrink-0 items-center justify-center p-1">
                    <span className="text-[8px] uppercase text-white/40" style={{ fontFamily: "var(--font-game), monospace" }}>Loading…</span>
                </div>
            ) : null}
            {streamError ? (
                <div className="flex w-[60px] shrink-0 items-center justify-center p-1">
                    <span className="text-center text-[8px] uppercase text-[#f44336]" style={{ fontFamily: "var(--font-game), monospace" }}>{streamError}</span>
                </div>
            ) : null}
            </div>
        </div>
    );
}
