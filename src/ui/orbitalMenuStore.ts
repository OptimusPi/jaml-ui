"use client";

// Orbital menu state machine — harvested from @pifreak/jammy-orbital
// (`radialMenuStore.ts`), itself excavated from JAMMY.
//
// Kept OUT of component state, deliberately. The original's comment explains
// why: "Zustand survives the component; hook useState did not." The mascot
// unmounts and remounts across scene transitions, and the open menu path must
// survive that. Move this into useState and you reintroduce the bug where the
// menu snaps back to root on every scene change.
//
// It is a plain external store here rather than Zustand: jaml-ui ships as an
// MCP app into a host we do not control, and a state library is a dependency
// that buys nothing this file cannot do in forty lines. `useSyncExternalStore`
// gives the same subscribe/snapshot contract with a React-owned tearing
// guarantee.
//
// Unlike the harvested original the store is *instanceable*. A single global
// meant two rings on one page shared one open menu — invisible in the app that
// only ever mounted one mascot, immediately visible on a Storybook docs page
// that renders several stories at once.

import { useCallback, useMemo, useSyncExternalStore } from "react";

/** Submenu push/pop: pills sink to center, the stack swaps, they rise again. */
export const ORBITAL_SINK_MS = 200;
/** Full close. Must match the `.j-orbital-pill` transition in jimbo.css. */
export const ORBITAL_CLOSE_MS = 320;

export interface JimboOrbitalState {
  /** Menu path. Empty = closed. `["main"]` = root open. */
  stack: string[];
  /** Zero-based page within the current menu, for menus past the page size. */
  page: number;
  /** Submenu labels pushed so far, for a breadcrumb. */
  breadcrumb: string[];
  /** Mid-animation: pills are collapsing to center. */
  closing: boolean;
}

export interface JimboOrbitalStore {
  subscribe: (listener: () => void) => () => void;
  getState: () => JimboOrbitalState;
  open: (root?: string) => void;
  close: () => void;
  back: () => void;
  navigateTo: (submenuLabel: string) => void;
  nextPage: (totalPages: number) => void;
  prevPage: (totalPages: number) => void;
  reset: () => void;
  /**
   * "Get out of the way — something arrived."
   *
   * Auto-closes the menu when background work produces a result worth looking
   * at, so the user isn't left staring at a submenu over fresh content. In
   * JAMMY this was seed-search results and `topScore` was the seed score; any
   * monotonically-improving quality metric works, and it is optional.
   *
   * Two independent triggers:
   *  - a new *best* score closes a submenu (depth > 1) but leaves root open
   *  - simply *more* results than last time closes any open menu
   */
  signalIncomingResults: (results: { count: number; topScore?: number }) => void;
}

const CLOSED: JimboOrbitalState = { stack: [], page: 0, breadcrumb: [], closing: false };

export function createJimboOrbitalStore(): JimboOrbitalStore {
  let state: JimboOrbitalState = CLOSED;
  let prevTopScore = -1;
  let prevResultCount = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());

  const set = (next: Partial<JimboOrbitalState>) => {
    state = { ...state, ...next };
    emit();
  };

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const armTimer = (fn: () => void, ms: number) => {
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, ms);
  };

  const close = () => {
    clearTimer();
    set({ closing: true });
    armTimer(() => set({ ...CLOSED }), ORBITAL_CLOSE_MS);
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getState: () => state,

    open: (root = "main") => {
      // Guard: skip when already at the target root. Without it, `open()` mints
      // a fresh state object, every subscriber re-renders, and any effect
      // depending on the menu state loops forever. Load-bearing — do not
      // "simplify" it away.
      if (state.stack.length === 1 && state.stack[0] === root && state.page === 0) return;
      clearTimer();
      set({ stack: [root], page: 0, breadcrumb: [], closing: false });
    },

    close,

    back: () => {
      if (state.stack.length <= 1) {
        set({ breadcrumb: [] });
        close();
        return;
      }
      clearTimer();
      set({ breadcrumb: state.breadcrumb.slice(0, -1), closing: true });
      armTimer(
        () => set({ stack: state.stack.slice(0, -1), page: 0, closing: false }),
        ORBITAL_SINK_MS,
      );
    },

    navigateTo: (submenuLabel) => {
      clearTimer();
      set({ breadcrumb: [...state.breadcrumb, submenuLabel], closing: true });
      // Pills sink to center, *then* the stack swaps and they rise again. The
      // delay is what sells the push as one motion instead of a hard cut.
      armTimer(
        () => set({ stack: [...state.stack, submenuLabel], page: 0, closing: false }),
        ORBITAL_SINK_MS,
      );
    },

    nextPage: (totalPages) => {
      const pages = Math.max(1, totalPages);
      set({ page: pages <= 1 ? 0 : (state.page + 1) % pages });
    },

    prevPage: (totalPages) => {
      const pages = Math.max(1, totalPages);
      set({ page: pages <= 1 ? 0 : (state.page - 1 + pages) % pages });
    },

    reset: () => {
      clearTimer();
      prevTopScore = -1;
      prevResultCount = 0;
      set({ ...CLOSED });
    },

    signalIncomingResults: ({ count, topScore }) => {
      let shouldClose = false;

      if (count > 0 && topScore !== undefined && topScore > prevTopScore) {
        shouldClose = state.stack.length > 1;
      }
      if (count > 0 && count > prevResultCount) {
        shouldClose = shouldClose || state.stack.length > 0;
      }

      prevTopScore = count > 0 && topScore !== undefined ? topScore : -1;
      prevResultCount = count;

      if (shouldClose) close();
    },
  };
}

/** Shared store — the common case, one mascot per app. */
export const jimboOrbitalStore = createJimboOrbitalStore();

export interface JimboOrbitalMenuController extends JimboOrbitalState {
  /** Top of the stack, or `root` when closed. */
  currentMenu: string;
  /** The ring should be mounted. */
  isOpen: boolean;
  /** Pills should be animating toward center. */
  isClosing: boolean;
  /** The stack is deep enough that the south button means "back", not "exit". */
  canGoBack: boolean;
  open: () => void;
  close: () => void;
  back: () => void;
  navigateTo: (submenuLabel: string) => void;
  nextPage: (totalPages: number) => void;
  prevPage: (totalPages: number) => void;
  /** The single tap target: closed → open, open → close. */
  toggle: () => void;
}

export interface UseJimboOrbitalMenuProps {
  /** Root menu name. A welcome screen might open to `"welcome"` instead. */
  root?: string;
  /** Use a private store instead of the shared one. */
  store?: JimboOrbitalStore;
}

/** Controller for {@link JimboOrbitalMenu} — stack, pagination, close animation. */
export function useJimboOrbitalMenu({
  root = "main",
  store = jimboOrbitalStore,
}: UseJimboOrbitalMenuProps = {}): JimboOrbitalMenuController {
  // The server snapshot is the closed state: nothing is open before hydration,
  // and returning the live object would hand React a value that changes
  // between render passes.
  const state = useSyncExternalStore(store.subscribe, store.getState, () => CLOSED);

  const open = useCallback(() => store.open(root), [store, root]);
  const toggle = useCallback(() => {
    const { stack, closing } = store.getState();
    if (stack.length === 0 && !closing) store.open(root);
    else store.close();
  }, [store, root]);

  return useMemo(
    () => ({
      ...state,
      currentMenu: state.stack.at(-1) ?? root,
      isOpen: state.stack.length > 0,
      isClosing: state.closing && state.stack.length > 0,
      canGoBack: state.stack.length > 1,
      open,
      close: store.close,
      back: store.back,
      navigateTo: store.navigateTo,
      nextPage: store.nextPage,
      prevPage: store.prevPage,
      toggle,
    }),
    [state, root, open, toggle, store],
  );
}
