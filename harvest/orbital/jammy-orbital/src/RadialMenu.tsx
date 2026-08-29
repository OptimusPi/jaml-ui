"use client";

// Excavated from JAMMY (`components/jimbo-ui/RadialNavigation/RadialMenu.tsx`).
//
// Changed on the way out: the orbit math that used to live inline here now
// lives in `./radialLayout` as pure functions. This file is the renderer only —
// it decides *what component* each item becomes and where the chrome sits.

import React, { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { MenuItem } from "./types";
import { RadialPill } from "./RadialPill";
import { RadialButton } from "./RadialButton";
import { RadialBadge } from "./RadialBadge";
import {
    FULL_CIRCLE_RAD,
    MIN_SOUTH_WIDTH,
    PAGE_CONTROL_LIFT,
    PILL_HALF_H,
    SOUTH_ANGLE_RAD,
    SOUTH_EDGE_INSET,
    layoutOrbitalArc,
    layoutOrbitalEllipse,
    southButtonWidth,
} from "./radialLayout";

// ── Type guards ───────────────────────────────────────────────────────────────

function hasDim(item: MenuItem): item is MenuItem & { _dim?: boolean } {
    return "_dim" in item;
}

function hasSouth(item: MenuItem): boolean {
    return "_south" in item && (item as MenuItem & { _south?: boolean })._south === true;
}

function hasIcon(item: MenuItem): item is MenuItem & { icon: string } {
    return "icon" in item && typeof item.icon === "string";
}

function hasCount(item: MenuItem): item is MenuItem & { count: number } {
    return "count" in item && typeof item.count === "number";
}

function isToggleItem(item: MenuItem): item is MenuItem & { active: boolean; disabled?: boolean } {
    return "active" in item && typeof item.active === "boolean";
}

function hasBadge(item: MenuItem): item is MenuItem & { badge: { label: string; state: "loading" | "success" | "error" } } {
    return "badge" in item && item.badge != null;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface RadialMenuProps {
    /** Items to display. The item flagged `_south` is always pinned at the bottom. */
    items: MenuItem[];
    /** When true, pills animate out to center. */
    showClosing: boolean;
    /** Mascot hit target / image size (px) — pills are pushed out to clear it. */
    mascotSizePx: number;
    /** Horizontal orbit radius (px). */
    orbitRadiusX: number;
    /** Vertical orbit radius (px). */
    orbitRadiusY: number;
    /** Vertical translation for keyboard dodge (px). */
    mascotTranslateY: number;
    /**
     * Height of the box the ring is sectioned into (px).
     *
     * When given, the south pill is pinned to the BOTTOM EDGE of that box and
     * spans its full width, instead of riding the orbit at `radius + 8`. That is
     * Balatro's own modal law — the way out of a modal is always a full-width
     * orange button along the bottom, at any modal size — and it is why the
     * south slot must not move when the orbit radius changes.
     */
    boxHeight?: number;
    /** Current menu name — used for stable React keys across menu swaps. */
    currentMenu: string;
    onItemClick: (item: MenuItem) => void;
    onBack: () => void;
    /** Optional breadcrumb, rendered above the Back button. */
    breadcrumb?: ReactNode;
    showPageControls?: boolean;
    onPagePrev?: () => void;
    onPageNext?: () => void;
}

/**
 * Orbital radial menu.
 *
 * South (`_south`) stays pinned under the mascot; everyone else sits on an
 * ellipse at equal angle steps with a single outward push if a pill would
 * overlap the center. See `./radialLayout` for why there is no iterative solver.
 */
export function RadialMenu({
    items,
    showClosing,
    mascotSizePx,
    orbitRadiusX,
    orbitRadiusY,
    mascotTranslateY,
    boxHeight,
    currentMenu,
    onItemClick,
    onBack,
    breadcrumb,
    showPageControls = false,
    onPagePrev,
    onPageNext,
}: RadialMenuProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [containerW, setContainerW] = useState(375);

    useLayoutEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const apply = () => setContainerW(Math.max(1, el.clientWidth));
        apply();
        const ro = new ResizeObserver(apply);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    if (items.length === 0) return null;

    // ── Separate the south-pinned item from the orbital ring ──────────────────
    const southItem = items.find(hasSouth) ?? null;
    const orbitalItems = items.filter((item) => !hasSouth(item));

    // South occupies a slot in the angular budget even though it renders at a
    // fixed position — that's what keeps the ring visually even around it.
    const totalSlots = orbitalItems.length + (southItem ? 1 : 0);
    const slotStepRad = FULL_CIRCLE_RAD / totalSlots;
    const orbitalStartAngle = southItem ? SOUTH_ANGLE_RAD + slotStepRad : SOUTH_ANGLE_RAD;

    // Balatro's exit law: the way out is a full-width orange button along the
    // very bottom of whatever container you are in — small modal, large modal,
    // or this ring's square. So when the box height is known, the south pill
    // takes the container's width and sits on its bottom edge, and it stays put
    // when the orbit radius changes. Without a box it falls back to the
    // excavated behaviour (ride the orbit, width derived from the ring).
    const pinnedSouth = boxHeight != null && Number.isFinite(boxHeight) && boxHeight > 0;
    const southWidth = pinnedSouth
        ? Math.max(MIN_SOUTH_WIDTH, containerW - SOUTH_EDGE_INSET * 2)
        : southButtonWidth(totalSlots, orbitRadiusX, containerW);

    // Chrome anchored relative to the south button so it stays attached to it
    // rather than to the viewport.
    const southButtonY = pinnedSouth
        ? boxHeight / 2 - PILL_HALF_H - SOUTH_EDGE_INSET
        : orbitRadiusY + 8;
    const breadcrumbCenterY = southButtonY - 46;
    const pageControlWidth = Math.max(56, Math.floor(southWidth * 0.5));
    const pageControlY = southButtonY - PAGE_CONTROL_LIFT;
    const pageControlLeftX = -(southWidth / 2) + pageControlWidth / 2;
    const pageControlRightX = southWidth / 2 - pageControlWidth / 2;

    const makeClickHandler = (item: MenuItem) => (e: React.MouseEvent) => {
        // The mascot itself is a tap target underneath; without this every pill
        // click would also toggle the menu closed.
        e.stopPropagation();
        if (item.action === "back-action") {
            onBack();
        } else {
            onItemClick(item);
        }
    };

    const measure = (item: MenuItem) => ({ label: item.label, hasToggleDot: isToggleItem(item) });

    // With a box, geometry follows the ORBIT LAW (see radialLayout): pills stack
    // by height inside the arc bounded by the Back button's tips and fly out to
    // the container walls. The arc must clear the topmost south chrome — the
    // page controls sit above Back when pagination is on, so they set the floor.
    // Boxless hosts keep the excavated ellipse behaviour unchanged.
    const southChromeTopY = showPageControls && southItem
        ? pageControlY - PILL_HALF_H
        : southButtonY - PILL_HALF_H;
    const solved = pinnedSouth && boxHeight != null
        ? layoutOrbitalArc(orbitalItems, containerW, boxHeight, southChromeTopY, measure)
        : layoutOrbitalEllipse(
              orbitalItems,
              orbitRadiusX,
              orbitRadiusY,
              orbitalStartAngle,
              slotStepRad,
              mascotSizePx,
              measure,
          );

    return (
        <div
            ref={rootRef}
            className="pointer-events-none absolute inset-0 z-30 flex min-w-0 items-center justify-center"
            style={{ transform: `translateY(${mascotTranslateY}px)` }}
        >
            {/* Zero-size anchor: every pill positions against this exact center point. */}
            <div className="relative h-0 w-0">
                {breadcrumb ? (
                    <div
                        className="pointer-events-auto absolute"
                        style={{
                            left: 0,
                            top: breadcrumbCenterY,
                            transform: "translate(-50%, -50%)",
                            zIndex: 20,
                        }}
                    >
                        {breadcrumb}
                    </div>
                ) : null}

                {solved.map(({ item, x, y }, i) => {
                    const isDim = hasDim(item) && item._dim === true;
                    return (
                        <RadialPill
                            // `currentMenu` in the key forces a fresh element per
                            // menu, so pills animate in from center on a submenu
                            // push instead of sliding from the old menu's slots.
                            key={`${item.label}-${i}-${currentMenu}`}
                            x={x}
                            y={y}
                            hiding={showClosing}
                        >
                            {renderItem(item, isDim ? "opacity-40" : "", makeClickHandler(item))}
                        </RadialPill>
                    );
                })}

                {southItem && (
                    <RadialPill x={0} y={southButtonY} hiding={showClosing}>
                        {renderSouthItem(southItem, southWidth, makeClickHandler(southItem))}
                    </RadialPill>
                )}

                {southItem && showPageControls && (
                    <>
                        <RadialPill x={pageControlLeftX} y={pageControlY} hiding={showClosing}>
                            <RadialButton
                                label="<"
                                color="blue"
                                tooltip="Previous page"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPagePrev?.();
                                }}
                                style={{ width: pageControlWidth }}
                            />
                        </RadialPill>
                        <RadialPill x={pageControlRightX} y={pageControlY} hiding={showClosing}>
                            <RadialButton
                                label=">"
                                color="blue"
                                tooltip="Next page"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPageNext?.();
                                }}
                                style={{ width: pageControlWidth }}
                            />
                        </RadialPill>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Renderers ─────────────────────────────────────────────────────────────────

function renderSouthItem(item: MenuItem, width: number, onClick: (e: React.MouseEvent) => void): ReactNode {
    const variant = item.label === "Start" ? "start" : "back";
    return (
        <RadialButton
            variant={variant}
            label={item.label}
            color="orange"
            tooltip={item.tooltip}
            onClick={onClick}
            style={{ width }}
        />
    );
}

/** Order matters: badge (non-interactive) is checked first so it can never become a button. */
function renderItem(item: MenuItem, className: string, onClick: (e: React.MouseEvent) => void): ReactNode {
    if (hasBadge(item)) {
        return (
            <RadialBadge
                label={item.badge.label}
                state={item.badge.state}
                color={item.color}
                tooltip={item.tooltip}
            />
        );
    }

    if (isToggleItem(item)) {
        return (
            <RadialButton
                variant="toggle"
                label={item.label}
                active={item.active}
                disabled={(item as { disabled?: boolean }).disabled === true}
                color={item.color}
                tooltip={item.tooltip}
                className={className}
                onClick={onClick}
            />
        );
    }

    if (hasIcon(item)) {
        return (
            <RadialButton
                variant="count"
                label={item.label}
                count={0}
                icon={item.icon}
                color={item.color}
                tooltip={item.tooltip}
                className={className}
                onClick={onClick}
            />
        );
    }

    if (hasCount(item)) {
        return (
            <RadialButton
                variant="count"
                label={item.label}
                count={item.count}
                color={item.color}
                tooltip={item.tooltip}
                className={className}
                onClick={onClick}
            />
        );
    }

    return (
        <RadialButton
            label={item.label}
            color={item.color}
            tooltip={item.tooltip}
            className={className}
            onClick={onClick}
        />
    );
}
