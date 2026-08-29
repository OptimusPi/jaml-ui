"use client";

// Orbital menu state machine — excavated from JAMMY (`lib/stores/radialMenuStore.ts`).
//
// Kept in Zustand rather than rewritten to useState/useReducer, deliberately.
// The original comment on this file explains why: "Zustand survives the
// component; hook useState did not." The mascot unmounts and remounts across
// scene transitions, and menu position must survive that. If you port this to
// component state you will reintroduce the bug where the menu snaps back to
// root on every scene change.
//
// The one app-specific hook (`updateSeedResults`, which auto-closed the menu
// when a better Balatro seed arrived) is generalized here to
// `signalIncomingResults` — see its doc comment.

import { create } from "zustand";
import { JIMBO_ANIMATIONS } from "./palette";

let closingTimer: ReturnType<typeof setTimeout> | null = null;

/** Clears the pending close/navigate animation timeout (e.g. on unmount). */
export function clearRadialMenuTimers(): void {
    if (closingTimer !== null) {
        clearTimeout(closingTimer);
        closingTimer = null;
    }
}

/** Full reset when the mascot unmounts. */
export function resetRadialMenuState(): void {
    clearRadialMenuTimers();
    useRadialMenuStore.setState({
        nav: { stack: [], page: 0 },
        breadcrumbStack: [],
        isClosing: false,
        announcementPrimedForDismiss: false,
    });
}

function armTimer(fn: () => void, ms: number): void {
    clearRadialMenuTimers();
    closingTimer = setTimeout(() => {
        closingTimer = null;
        fn();
    }, ms);
}

export interface RadialMenuNav {
    /** Menu path. Empty = closed. `["main"]` = root open. */
    stack: string[];
    /** Zero-based page within the current menu, for menus longer than the page size. */
    page: number;
}

interface RadialMenuSlice {
    nav: RadialMenuNav;
    breadcrumbStack: string[];
    isClosing: boolean;
    announcementPrimedForDismiss: boolean;
    prevTopScore: number;
    prevResultCount: number;
}

export interface RadialMenuStore extends RadialMenuSlice {
    open: (isWelcome: boolean) => void;
    close: () => void;
    back: () => void;
    navigateTo: (submenuLabel: string) => void;
    nextPage: (totalPages: number) => void;
    prevPage: (totalPages: number) => void;
    setAnnouncementPrimedForDismiss: (v: boolean) => void;
    resetAnnouncementPrimed: () => void;
    signalIncomingResults: (results: { count: number; topScore?: number }) => void;
}

export const useRadialMenuStore = create<RadialMenuStore>((set, get) => ({
    nav: { stack: [], page: 0 },
    breadcrumbStack: [],
    isClosing: false,
    announcementPrimedForDismiss: false,
    prevTopScore: -1,
    prevResultCount: 0,

    resetAnnouncementPrimed: () => {
        if (!get().announcementPrimedForDismiss) return;
        set({ announcementPrimedForDismiss: false });
    },

    setAnnouncementPrimedForDismiss: (v) => {
        if (get().announcementPrimedForDismiss === v) return;
        set({ announcementPrimedForDismiss: v });
    },

    open: (isWelcome) => {
        const { nav } = get();
        const target = isWelcome ? "welcome" : "main";
        // Guard: skip if already at the target root. Without this, `open()` mints
        // a new array reference, every Zustand subscriber re-renders, and any
        // effect depending on the menu state object loops forever. This guard is
        // load-bearing — do not "simplify" it away.
        if (nav.stack.length === 1 && nav.stack[0] === target && nav.page === 0) return;
        set({ nav: { stack: [target], page: 0 } });
    },

    close: () => {
        clearRadialMenuTimers();
        set({ isClosing: true });
        armTimer(() => {
            set({ nav: { stack: [], page: 0 }, breadcrumbStack: [], isClosing: false });
        }, JIMBO_ANIMATIONS.MENU_ORBIT_DURATION);
    },

    back: () => {
        const stackBefore = get().nav.stack;
        set((s) => ({ breadcrumbStack: s.breadcrumbStack.slice(0, -1) }));
        if (stackBefore.length <= 1) {
            get().close();
            return;
        }
        clearRadialMenuTimers();
        set({ isClosing: true });
        armTimer(() => {
            set((s) => ({
                nav: { stack: s.nav.stack.slice(0, -1), page: 0 },
                isClosing: false,
            }));
        }, JIMBO_ANIMATIONS.MENU_SINK_DURATION);
    },

    navigateTo: (submenuLabel) => {
        clearRadialMenuTimers();
        set((s) => ({
            breadcrumbStack: [...s.breadcrumbStack, submenuLabel],
            isClosing: true,
        }));
        // Pills sink to center, *then* the stack swaps and they rise again. The
        // delay is what sells the push/pop as one motion instead of a hard cut.
        armTimer(() => {
            set((s) => ({
                nav: { stack: [...s.nav.stack, submenuLabel], page: 0 },
                isClosing: false,
            }));
        }, JIMBO_ANIMATIONS.MENU_SINK_DURATION);
    },

    nextPage: (totalPages) =>
        set((s) => {
            const pages = Math.max(1, totalPages);
            const next = pages <= 1 ? 0 : (s.nav.page + 1) % pages;
            return { nav: { ...s.nav, page: next } };
        }),

    prevPage: (totalPages) =>
        set((s) => {
            const pages = Math.max(1, totalPages);
            const prev = pages <= 1 ? 0 : (s.nav.page - 1 + pages) % pages;
            return { nav: { ...s.nav, page: prev } };
        }),

    /**
     * "Get out of the way — something arrived."
     *
     * Auto-closes the menu when background work produces a result worth looking
     * at, so the user isn't left staring at a submenu over fresh content. In
     * JAMMY this was seed-search results and `topScore` was the seed score; any
     * monotonically-improving quality metric works, and it is optional.
     *
     * Two independent triggers:
     *  - a new *best* score closes a submenu (stack depth > 1) but leaves root open
     *  - simply *more* results than last time closes any open menu
     */
    signalIncomingResults: ({ count, topScore }) => {
        const state = get();
        let shouldClose = false;

        if (count > 0 && topScore !== undefined && topScore > state.prevTopScore) {
            shouldClose = state.nav.stack.length > 1;
        }

        if (count > 0 && count > state.prevResultCount) {
            shouldClose = shouldClose || state.nav.stack.length > 0;
        }

        set({
            prevTopScore: count > 0 && topScore !== undefined ? topScore : -1,
            prevResultCount: count,
        });

        if (shouldClose) {
            get().close();
        }
    },
}));
