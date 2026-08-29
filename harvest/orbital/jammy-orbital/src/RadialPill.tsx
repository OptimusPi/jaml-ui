"use client";

// Excavated from JAMMY (`components/jimbo-ui/RadialNavigation/RadialPill.tsx`), verbatim.

import React from "react";
import "./styles.css";

export interface RadialPillProps {
    /** Horizontal offset from orbit center (px). */
    x: number;
    /** Vertical offset from orbit center (px). */
    y: number;
    /** When true, the pill collapses to center (exit animation). */
    hiding: boolean;
    children: React.ReactNode;
}

/**
 * Absolutely-positioned wrapper for one radial menu item.
 *
 * Position rides on CSS custom properties + one shared stylesheet rule rather
 * than per-instance `<style>` tags — the earlier version injected a style tag
 * per pill, which thrashed the CSSOM on every menu change.
 */
export function RadialPill({ x, y, hiding, children }: RadialPillProps) {
    return (
        <div
            className="orbital-pill"
            data-hiding={hiding ? "true" : "false"}
            style={
                {
                    "--orbital-x": `${hiding ? 0 : x}px`,
                    "--orbital-y": `${hiding ? 0 : y}px`,
                } as React.CSSProperties
            }
        >
            <span className="orbital-pill-inner">{children}</span>
        </div>
    );
}
