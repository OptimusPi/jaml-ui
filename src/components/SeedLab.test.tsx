import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * motely-wasm can't boot in jsdom, so the engine is a stand-in that hands the
 * test its callbacks: `engine.hit()` is a scored find, `engine.tick()` a
 * progress report (which is when SeedLab flushes hits to the list), and
 * `engine.finish()` ends the sweep.
 */
const engine = vi.hoisted(() => {
  type Scored = (r: { seed: string; score: number; tallies: number[] }) => void;
  const state = {
    onScored: null as Scored | null,
    onProgress: null as ((p: unknown) => void) | null,
    resolve: null as (() => void) | null,
    starts: 0,
    hit(seed: string, score = 1) {
      state.onScored?.({ seed, score, tallies: [] });
    },
    tick() {
      state.onProgress?.({
        seedsSearched: 0n,
        matchingSeeds: 0n,
        percentComplete: 0.5,
        seedsPerMillisecond: 1,
        elapsedMilliseconds: 0n,
      });
    },
    finish() {
      const done = state.resolve;
      state.resolve = null;
      done?.();
    },
  };
  return state;
});

vi.mock("motely-wasm", () => {
  class CancellationToken {
    isCancellationRequested = false;
    cancel() {
      this.isCancellationRequested = true;
    }
  }
  const settings = {
    seedScoreDesc: {},
    withThreadCount: () => settings,
    withQuietMode: () => settings,
    withSequentialSearch: () => settings,
    withBatchCharacterCount: () => settings,
    withStartBatchIndex: () => settings,
    withEndBatchIndex: () => settings,
    withProgressReportIntervalMs: () => settings,
    withProgressCallback: (cb: (p: unknown) => void) => {
      engine.onProgress = cb;
      return settings;
    },
    withScoredResultCallback: (cb: typeof engine.onScored) => {
      engine.onScored = cb;
      return settings;
    },
    withSeedMatchCallback: () => settings,
    start: () => {
      engine.starts++;
      const done = new Promise<void>((resolve) => {
        engine.resolve = resolve;
      });
      return {
        waitForCompletionAsync: () => done,
        totalSeedsSearched: 0n,
        matchingSeeds: 0n,
        seedsPerSecond: 0,
        elapsedMs: 0n,
      };
    },
  };
  return {
    default: { getStatus: () => "booted", BootStatus: { Booted: "booted" }, boot: async () => {} },
    CancellationToken,
    Errors: { last: () => null },
    JamlConfigLoader: { fromJaml: () => ({ should: [] }) },
    JamlSearchBuilder: { createSettings: () => settings },
  };
});

// The editor and the analyser are their own components with their own wasm needs.
vi.mock("./JamlIde.js", () => ({ JamlIde: () => null }));
vi.mock("./Jamlyzer.js", () => ({ Jamlyzer: () => null }));

/* IntersectionObserver stand-in: the test decides when the sentinel is in view. */
class FakeIntersectionObserver {
  static live = new Set<FakeIntersectionObserver>();
  targets: Element[] = [];
  constructor(private callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.live.add(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  unobserve() {}
  disconnect() {
    FakeIntersectionObserver.live.delete(this);
  }
  takeRecords() {
    return [];
  }
  static scrollIntoView() {
    for (const io of [...FakeIntersectionObserver.live]) {
      io.callback(
        io.targets.map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry),
        io as unknown as IntersectionObserver,
      );
    }
  }
}

const { SeedLab, MAX_HITS, HIT_PAGE_SIZE } = await import("./SeedLab.js");

function stubLayout(wide: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: wide,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

const seed = (i: number) => `S${String(i).padStart(7, "0")}`;
const rows = () => document.querySelectorAll("tbody tr");
const rowSeeds = () => [...rows()].map((r) => r.querySelector("th")?.textContent);

async function startSearch() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Start Search" }));
  });
}

async function findHits(from: number, to: number) {
  await act(async () => {
    for (let i = from; i < to; i++) engine.hit(seed(i));
    engine.tick();
  });
}

async function finishSearch() {
  await act(async () => {
    engine.finish();
  });
}

beforeEach(() => {
  engine.starts = 0;
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  cleanup();
  FakeIntersectionObserver.live.clear();
  vi.unstubAllGlobals();
});

describe.each([
  ["wide (pyramid dock)", true],
  ["narrow (stacked dock)", false],
])("SeedLab results, %s", (_name, wide) => {
  beforeEach(() => stubLayout(wide));

  it("keeps hits past the old 80 and pages them in as the sentinel scrolls into view", async () => {
    render(<SeedLab />);
    await startSearch();
    await findHits(0, 250);
    await finishSearch();

    // One page renders, newest first; the rest are kept, not dropped.
    expect(rows()).toHaveLength(HIT_PAGE_SIZE);
    expect(rowSeeds()[0]).toBe(seed(249));
    expect(screen.getByText(/Showing 100 of 250 hits/)).toBeTruthy();

    await act(async () => FakeIntersectionObserver.scrollIntoView());
    expect(rows()).toHaveLength(200);

    await act(async () => FakeIntersectionObserver.scrollIntoView());
    expect(rows()).toHaveLength(250);
    expect(rowSeeds().at(-1)).toBe(seed(0));
    // Everything is shown: no sentinel, nothing left observing.
    expect(screen.queryByTestId("seed-hit-sentinel")).toBeNull();
    expect(FakeIntersectionObserver.live.size).toBe(0);
  });
});

describe("SeedLab results", () => {
  beforeEach(() => stubLayout(true));

  it("the Show more button steps a page without IntersectionObserver", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<SeedLab />);
    await startSearch();
    await findHits(0, 150);
    expect(rows()).toHaveLength(100);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Show 50 more" }));
    });
    expect(rows()).toHaveLength(150);
  });

  it("says so when the list hits its ceiling", async () => {
    render(<SeedLab />);
    await startSearch();
    await findHits(0, MAX_HITS + 7);
    await finishSearch();

    const note = screen.getByRole("status");
    expect(note.textContent).toContain("kept the first 100,000 hits");
    expect(note.textContent).toContain("7 more were found and not kept");
    expect(screen.getByText(/Showing 100 of 100,000 hits/)).toBeTruthy();
    // Still one page in the DOM, not 100k rows.
    expect(rows()).toHaveLength(HIT_PAGE_SIZE);
  });

  it("a new search clears the list and starts back at one page", async () => {
    render(<SeedLab />);
    await startSearch();
    await findHits(0, 250);
    await finishSearch();
    await act(async () => FakeIntersectionObserver.scrollIntoView());
    expect(rows()).toHaveLength(200);

    await startSearch();
    expect(engine.starts).toBe(2);
    expect(rows()).toHaveLength(0);
    expect(screen.getByText("Sweeping…")).toBeTruthy();

    await findHits(1000, 1150);
    expect(rows()).toHaveLength(HIT_PAGE_SIZE);
    expect(rowSeeds()).not.toContain(seed(0));
    await finishSearch();
  });

  it("clicking a row still picks it", async () => {
    render(<SeedLab />);
    await startSearch();
    await findHits(0, 3);
    fireEvent.click(rows()[1]);
    expect(rows()[1].getAttribute("aria-selected")).toBe("true");
    await finishSearch();
  });
});
