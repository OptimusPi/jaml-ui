"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { JimboColorOption, JIMBO_ANIMATIONS, PlayingCard, Suit } from "@/lib/jimbo-ui/types";

// Suit symbols and colors
const SUIT_CONFIG: Record<Suit, { symbol: string; color: string }> = {
    hearts: { symbol: "♥", color: JimboColorOption.RED },
    diamonds: { symbol: "♦", color: JimboColorOption.ORANGE },
    clubs: { symbol: "♣", color: JimboColorOption.BLUE },
    spades: { symbol: "♠", color: JimboColorOption.DARK_GREY },
};

export interface PlayingCardProps {
    card: PlayingCard;
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    /** Rotation in degrees for fan effect */
    rotation?: number;
    /** Vertical offset for selected state */
    lifted?: boolean;
}

/**
 * Standard playing card component
 *
 * Behavior:
 * - Hover: Juice up (scale) + slight tilt
 * - Selected: Lifted up vertically
 * - Fan layout: Cards overlap with rotation
 */
export function JimboPlayingCard({
    card,
    selected = false,
    disabled = false,
    onClick,
    className,
    rotation = 0,
    lifted = false,
}: PlayingCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const suitConfig = SUIT_CONFIG[card.suit];
    const _isRed = card.suit === "hearts" || card.suit === "diamonds";

    // Calculate tilt based on mouse position (simplified)
    const tiltX = isHovered ? JIMBO_ANIMATIONS.CARD_TILT_MAX * 0.5 : 0;
    const tiltY = isHovered ? JIMBO_ANIMATIONS.CARD_TILT_MAX * 0.3 : 0;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative overflow-hidden rounded-lg transition-all",
                "flex h-24 w-16 flex-col",
                "border-2",
                disabled && "cursor-not-allowed opacity-67",
                selected && "ring-2 ring-white",
                className,
            )}
            style={{
                backgroundColor: JimboColorOption.WHITE,
                borderColor: selected ? JimboColorOption.WHITE : JimboColorOption.GREY,
                transform: [
                    `rotate(${rotation}deg)`,
                    lifted || selected ? "translateY(-12px)" : "",
                    isHovered ? `scale(${JIMBO_ANIMATIONS.JUICE_UP_SCALE})` : "scale(1)",
                    isHovered ? `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)` : "",
                ]
                    .filter(Boolean)
                    .join(" "),
                transformOrigin: "bottom center",
                transition: `transform ${JIMBO_ANIMATIONS.JUICE_DURATION}ms ${JIMBO_ANIMATIONS.JUICE_EASING}`,
                zIndex: isHovered ? 50 : selected ? 40 : "auto",
            }}
        >
            {/* Card content */}
            <div className="flex flex-1 flex-col p-1" style={{ fontFamily: "var(--font-serif), monospace", color: suitConfig.color }}>
                {/* Top rank + suit */}
                <div className="text-xs leading-none">{card.rank}</div>
                <div className="text-sm leading-none">{suitConfig.symbol}</div>

                {/* Center suit */}
                <div className="flex flex-1 items-center justify-center text-2xl">{suitConfig.symbol}</div>

                {/* Bottom rank + suit (inverted) */}
                <div className="rotate-180 text-right text-xs leading-none">{card.rank}</div>
            </div>

            {/* Enhancement overlay */}
            {card.enhancement && (
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        backgroundColor:
                            card.enhancement === "mult"
                                ? JimboColorOption.RED
                                : card.enhancement === "bonus"
                                    ? JimboColorOption.BLUE
                                    : card.enhancement === "gold"
                                        ? JimboColorOption.GOLD_TEXT
                                        : "transparent",
                    }}
                />
            )}

            {/* Edition effect */}
            {card.edition && (
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            card.edition === "holographic"
                                ? "linear-gradient(135deg, transparent 40%, rgba(93,93,255,0.3) 50%, transparent 60%)"
                                : card.edition === "foil"
                                    ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(93,93,255,0.2) 100%)"
                                    : "none",
                    }}
                />
            )}

            {/* Seal indicator */}
            {card.seal && (
                <div
                    className="absolute right-1 bottom-1 h-3 w-3 rounded-full"
                    style={{
                        backgroundColor:
                            card.seal === "gold"
                                ? JimboColorOption.GOLD_TEXT
                                : card.seal === "red"
                                    ? JimboColorOption.RED
                                    : card.seal === "blue"
                                        ? JimboColorOption.BLUE
                                        : JimboColorOption.PURPLE,
                    }}
                />
            )}
        </button>
    );
}

/**
 * Card back - for deck display
 */
export function JimboCardBack({ className }: { className?: string }) {
    return (
        <div
            className={cn("h-24 w-16 rounded-lg", "border-2", className)}
            style={{
                backgroundColor: JimboColorOption.RED,
                borderColor: JimboColorOption.WHITE,
                backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(0,0,0,0.1) 4px,
            rgba(0,0,0,0.1) 8px
          )
        `,
            }}
        />
    );
}

/**
 * Fan of cards - handles overlap and rotation
 */
export function JimboCardFan({
    cards,
    selectedIndices = [],
    onCardClick,
    maxSpread = 60, // degrees total
}: {
    cards: PlayingCard[];
    selectedIndices?: number[];
    onCardClick?: (index: number) => void;
    maxSpread?: number;
}) {
    const cardCount = cards.length;
    const spreadPerCard = cardCount > 1 ? maxSpread / (cardCount - 1) : 0;
    const startRotation = -maxSpread / 2;

    return (
        <div className="relative flex h-32 items-end justify-center" style={{ width: `${cardCount * 40 + 60}px` }}>
            {cards.map((card, index) => {
                const rotation = cardCount > 1 ? startRotation + index * spreadPerCard : 0;
                const selected = selectedIndices.includes(index);

                return (
                    <div
                        key={`${card.suit}-${card.rank}`}
                        className="absolute"
                        style={{
                            left: `${index * 40}px`,
                            zIndex: index,
                        }}
                    >
                        <JimboPlayingCard
                            card={card}
                            rotation={rotation}
                            selected={selected}
                            lifted={selected}
                            onClick={() => onCardClick?.(index)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
