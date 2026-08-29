"use client";

// Viewport geometry — excavated from JAMMY (`lib/radialMenuViewport.ts`), verbatim.
//
// Two jobs, both mobile-only concerns that are easy to forget when reusing this:
//  1. Shrink the orbit radius on narrow phones so pills don't run off-screen.
//  2. Dodge the soft keyboard, so the mascot + orbit lift above it when an input
//     is focused rather than being covered.

import { useSyncExternalStore } from "react";

export interface RadialViewportSnapshot {
    /** Base orbit radius before per-item growth, px. */
    baseRadius: number;
    /** How far to lift the mascot so the soft keyboard doesn't cover it, px. */
    keyboardHeight: number;
}

/**
 * React requires `getSnapshot` to return the **same object reference** when
 * values are unchanged. A fresh `{ ... }` every call makes `useSyncExternalStore`
 * think the store changed every render → "maximum update depth exceeded".
 * See: https://react.dev/reference/react/useSyncExternalStore
 */
const SERVER_SNAPSHOT: RadialViewportSnapshot = Object.freeze({
    baseRadius: 66,
    keyboardHeight: 0,
});

const clientCache: RadialViewportSnapshot = {
    baseRadius: SERVER_SNAPSHOT.baseRadius,
    keyboardHeight: SERVER_SNAPSHOT.keyboardHeight,
};

function getServerSnapshot(): RadialViewportSnapshot {
    return SERVER_SNAPSHOT;
}

function readGeometry(): { baseRadius: number; keyboardHeight: number } {
    if (typeof window === "undefined") {
        return { baseRadius: 66, keyboardHeight: 0 };
    }
    const w = window.innerWidth;
    const baseRadius = w < 375 ? 58 : 66;

    const vv = window.visualViewport;
    let keyboardHeight = 0;
    if (vv) {
        const raw = Math.max(0, window.innerHeight - vv.height);
        // >100px means a real keyboard, not a URL bar collapse. The 0.6 factor
        // is intentional: lifting by the full keyboard height overshoots and
        // pushes the mascot off the top on short viewports.
        keyboardHeight = raw > 100 ? raw * 0.6 : 0;
    }
    return { baseRadius, keyboardHeight };
}

function getSnapshot(): RadialViewportSnapshot {
    if (typeof window === "undefined") return SERVER_SNAPSHOT;
    const { baseRadius, keyboardHeight } = readGeometry();
    if (clientCache.baseRadius === baseRadius && clientCache.keyboardHeight === keyboardHeight) {
        return clientCache;
    }
    clientCache.baseRadius = baseRadius;
    clientCache.keyboardHeight = keyboardHeight;
    return clientCache;
}

function subscribe(onStoreChange: () => void): () => void {
    if (typeof window === "undefined") return () => {};

    const run = () => onStoreChange();
    const vv = window.visualViewport;
    window.addEventListener("resize", run);
    vv?.addEventListener("resize", run);
    return () => {
        window.removeEventListener("resize", run);
        vv?.removeEventListener("resize", run);
    };
}

/** Keyboard dodge + narrow-orbit radius, with a stable snapshot identity. */
export function useRadialViewportGeometry(): RadialViewportSnapshot {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
