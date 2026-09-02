"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import bootsharp, { Analyze, type MotelyJamlyzerEvents } from "motely-wasm";
import { parseJamlSeeds } from "../../lib/jaml/jamlSeeds.js";
import { JimboPanel } from "../../ui/JimboPanel.js";
import { JimboInnerPanel } from "../../ui/panel.js";
import { JimboText } from "../../ui/jimboText.js";
import { JimboBadge } from "../../ui/JimboBadge.js";
import { JimboRow } from "../../ui/JimboLayout.js";

/**
 * The PRNG tape.
 *
 * `JamlyzerEvents` shows the first 8 rolls of 12 streams and drops the rest on
 * the floor. 25.1.0 dropped resumeSeeds; paging is `Analyze.seedsPaged(jaml, n)`
 * with a growing n, then we keep only the new suffix.
 *
 * Nothing shipped has ever used it. This scrolls it.
 */

/** The 14 streams the engine actually rolls. Two of them have never had a UI. */
const STREAMS = [
  { key: "luckyMoney", label: "Lucky money", kind: "bool", fresh: false },
  { key: "luckyMult", label: "Lucky mult", kind: "bool", fresh: false },
  { key: "cavendish", label: "Cavendish", kind: "bool", fresh: false },
  { key: "grosMichel", label: "Gros Michel", kind: "bool", fresh: false },
  { key: "space", label: "Space Joker", kind: "bool", fresh: false },
  { key: "business", label: "Business Card", kind: "bool", fresh: false },
  { key: "bloodstone", label: "Bloodstone", kind: "bool", fresh: false },
  { key: "parking", label: "Parking Meter", kind: "bool", fresh: false },
  { key: "eightBall", label: "Eight Ball", kind: "bool", fresh: false },
  { key: "glass", label: "Glass Joker", kind: "bool", fresh: false },
  { key: "omenGlobe", label: "Omen Globe", kind: "bool", fresh: false },
  { key: "theWheel", label: "The Wheel", kind: "bool", fresh: false },
  { key: "wheelOfFortune", label: "Wheel of Fortune", kind: "num", fresh: true },
  { key: "misprint", label: "Misprint", kind: "num", fresh: true },
] as const;

type StreamKey = (typeof STREAMS)[number]["key"];

/** Accumulated rolls, one growing array per stream. */
type Tape = Record<StreamKey, (boolean | number)[]>;

const emptyTape = (): Tape =>
  Object.fromEntries(STREAMS.map((s) => [s.key, []])) as unknown as Tape;

/**
 * Typed arrays come back for the two numeric streams, plain arrays for the
 * booleans; normalise both to a plain array before appending.
 */
function appendPage(tape: Tape, events: MotelyJamlyzerEvents): Tape {
  const next = {} as Tape;
  for (const s of STREAMS) {
    const incoming = events[s.key] as ArrayLike<boolean | number> | undefined;
    next[s.key] = incoming ? tape[s.key].concat(Array.from(incoming)) : tape[s.key];
  }
  return next;
}

export interface JamlyzerTapeProps {
  /** A JAML filter. Its `seeds:` list must name exactly one seed. */
  jaml: string;
  /** Rolls fetched per page. The engine's own default is 20. */
  pageSize?: number;
  /** Stop after this many rolls so a runaway scroll can't page forever. */
  maxRolls?: number;
}

interface TapeState {
  tape: Tape;
  rollOffset: number;
  pages: number;
  status: "idle" | "loading" | "ready" | "done" | "error";
  error: string | null;
}

const freshState = (): TapeState => ({
  tape: emptyTape(),
  rollOffset: 0,
  pages: 0,
  status: "idle",
  error: null,
});

export function JamlyzerTape({
  jaml,
  pageSize = 40,
  maxRolls = 4000,
}: JamlyzerTapeProps) {
  // One atom, so swapping the filter is a single reset rather than five
  // cascading ones.
  const [state, setState] = useState<TapeState>(freshState);

  // The cursor lives in a ref, not state: a stale closure reading it would
  // silently re-fetch the same window. It carries the filter it belongs to, so
  // it invalidates itself rather than needing a render-phase reset.
  const cursorRef = useRef<{ jaml: string; rolls: number }>({ jaml, rolls: 0 });
  const busyRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset during render rather than in an effect — React re-renders before it
  // paints, so there is no flash of the previous seed's tape and no cascading
  // render.
  const [prevJaml, setPrevJaml] = useState(jaml);
  if (prevJaml !== jaml) {
    setPrevJaml(jaml);
    setState(freshState());
  }

  const loadPage = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setState((prev) => ({ ...prev, status: "loading" }));
    try {
      if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();

      if (cursorRef.current.jaml !== jaml) {
        cursorRef.current = { jaml, rolls: 0 };
      }

      const count = parseJamlSeeds(jaml).length;
      if (count !== 1) {
        throw new Error(
          `The tape follows one seed at a time; this filter names ${count}. Put a single seed in \`seeds:\`.`,
        );
      }

      const from = cursorRef.current.rolls;
      const want = Math.min(from + pageSize, maxRolls);
      const [result] = Analyze.seedsPaged(jaml, want);
      if (!result) throw new Error("The engine returned no result for this seed.");

      const sliced = {} as MotelyJamlyzerEvents;
      for (const s of STREAMS) {
        const incoming = result.events[s.key] as ArrayLike<boolean | number> | undefined;
        (sliced as Record<string, unknown>)[s.key] = incoming
          ? Array.from(incoming).slice(from)
          : [];
      }
      cursorRef.current = { jaml, rolls: want };
      const offset = result.streamStates.rollOffset;
      setState((prev) => ({
        ...prev,
        tape: appendPage(prev.tape, sliced),
        rollOffset: offset,
        pages: prev.pages + 1,
        status: want >= maxRolls ? "done" : "ready",
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setState((prev) => ({ ...prev, status: "error", error: message }));
    } finally {
      busyRef.current = false;
    }
  }, [jaml, pageSize, maxRolls]);

  useEffect(() => {
    if (state.status === "idle") void loadPage();
  }, [state.status, loadPage]);

  // Auto-page when the foot of the tape scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || state.status === "done" || state.status === "error") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadPage();
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [state.status, loadPage]);

  const { tape, rollOffset, pages, status, error } = state;
  const loaded = tape.luckyMoney.length;

  return (
    <JimboPanel title="PRNG tape" tone="gold">
      <JimboRow wrap gap="sm" align="center">
        <JimboText size="xs" tone="grey">
          roll offset <span style={{ fontFamily: "var(--j-font-code)" }}>{rollOffset}</span>
        </JimboText>
        <JimboBadge tone="purple" size="sm">{loaded} rolls</JimboBadge>
        <JimboBadge tone="purple" size="sm">{pages} pages</JimboBadge>
        {status === "loading" && (
          <JimboText size="xs" tone="grey">
            paging…
          </JimboText>
        )}
        {status === "done" && (
          <JimboText size="xs" tone="grey">
            stopped at {maxRolls}
          </JimboText>
        )}
      </JimboRow>

      {error && (
        <JimboInnerPanel className="j-stack j-stack--gap-xs">
          <JimboText size="xs" tone="red">
            {error}
          </JimboText>
        </JimboInnerPanel>
      )}

      {STREAMS.map((s) => {
        const values = tape[s.key];
        if (!values.length) return null;
        const hits =
          s.kind === "bool"
            ? (values as boolean[]).filter(Boolean).length
            : (values as number[]).filter((v) => v !== 0).length;
        const rate = values.length ? ((hits / values.length) * 100).toFixed(1) : "0.0";

        return (
          <JimboInnerPanel key={s.key} className="j-stack j-stack--gap-xs">
            <JimboRow wrap gap="xs" align="center">
              <JimboText size="xs" tone="grey">
                {s.label}
              </JimboText>
              {s.fresh && (
                <JimboBadge tone="orange" size="sm">
                  never rendered before
                </JimboBadge>
              )}
              <JimboText size="micro" tone="grey">
                {hits}/{values.length} · {rate}%
              </JimboText>
            </JimboRow>

            {/* The tape itself. Dense on purpose — the pattern over hundreds of
                rolls is the thing you came to see, not any single cell. */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2px",
                fontFamily: "var(--j-font-code)",
              }}
            >
              {values.map((v, i) =>
                s.kind === "bool" ? (
                  <span
                    key={i}
                    title={`roll ${i} · ${v ? "hit" : "miss"}`}
                    style={{
                      width: 8,
                      height: 14,
                      borderRadius: 2,
                      background: v ? "var(--j-gold)" : "var(--j-dark-grey)",
                    }}
                  />
                ) : (
                  <span
                    key={i}
                    title={`roll ${i}`}
                    style={{
                      minWidth: 14,
                      height: 14,
                      padding: "0 2px",
                      borderRadius: 2,
                      fontSize: 9,
                      lineHeight: "14px",
                      textAlign: "center",
                      color: v ? "var(--j-darkest)" : "var(--j-grey)",
                      background: v ? "var(--j-gold)" : "var(--j-dark-grey)",
                    }}
                  >
                    {String(v)}
                  </span>
                ),
              )}
            </div>
          </JimboInnerPanel>
        );
      })}

      <div ref={sentinelRef} style={{ height: 1 }} />

      {status === "error" && (
        <button type="button" className="j-btn j-btn--orange j-btn--full" onClick={() => void loadPage()}>
          <span className="j-btn__face">Retry</span>
        </button>
      )}
    </JimboPanel>
  );
}
