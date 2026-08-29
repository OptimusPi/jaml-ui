import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAntesCached } from "./run-card";
import { buildWatchList, JamlyzeBody } from "./JamlyzePanel";

// UX Law 2: triage is Tinder, not a table. One verdict-first card at a time,
// thumb-speed: swipe / arrows / buttons, then auto-advance. Kept seeds land
// in the pile strip below; skipped seeds just advance.
//
// NOTE: jaml-ui's JimboSwipeDeck was considered but not used — it is not
// re-exported from the published "jaml-ui" entry points (only dist-internal),
// and its inline-styled icon buttons can't carry the lab's j-btn/vars look.
// The deck mechanics (drag, threshold, fly-out) are re-implemented here so
// the card uses j-btn classes and results-triage.css tokens.

const SWIPE_THRESHOLD = 70;
const FLY_MS = 180;

export function ResultsPanel({ results, selectedSeed, kept, onSelect, onKeep, jaml, keyboardActive }) {
  const [cursor, setCursor] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState(null); // "keep" | "skip"
  const [selectedAnte, setSelectedAnte] = useState(null);
  const dragStart = useRef(null);
  const downTime = useRef(0);
  const draggingRef = useRef(false);
  const flyTimer = useRef(null);
  const deckRef = useRef(null);
  const pileRef = useRef(null);

  const total = results.length;
  const cleared = cursor >= total && total > 0;
  const current = cleared ? null : results[cursor];

  // ── Run Card: the seed's full ante-by-ante story as sprites, not a bare
  // code string. Analysis is synchronous wasm (Jamlyze runs it per keystroke);
  // the visible card computes in render, cached per jaml+seed in run-card.js.
  // JamlyzeBody (shared with the standalone Jamlyze pane) renders the full
  // ante-tabbed breakdown right here — no separate panel needed to see it.
  const watch = useMemo(() => buildWatchList(jaml || ""), [jaml]);
  const antes = current ? getAntesCached(jaml || "", current.seed) : null;

  // Reset the ante tab back to the first one whenever the card changes.
  const currentSeed = current ? current.seed : null;
  const currentSeedRef = useRef(currentSeed);
  useEffect(() => {
    if (currentSeed !== currentSeedRef.current) {
      currentSeedRef.current = currentSeed;
      setSelectedAnte(null);
    }
  }, [currentSeed]);

  // Prefetch the next two cards from an idle macrotask; cancelled the moment
  // a drag starts — thumb speed beats speculation.
  useEffect(() => {
    if (!results.length || cleared) return undefined;
    const t = setTimeout(() => {
      if (draggingRef.current) return;
      for (let k = 1; k <= 2; k += 1) {
        const nx = results[cursor + k];
        if (nx) getAntesCached(jaml || "", nx.seed);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [cursor, results, jaml, cleared]);

  // A fresh search replaces the results array — restart the deck when the
  // first seed changes (or the list empties).
  const deckSeed = results[0] ? results[0].seed : null;
  const deckSeedRef = useRef(deckSeed);
  useEffect(() => {
    if (deckSeed !== deckSeedRef.current) {
      deckSeedRef.current = deckSeed;
      setCursor(0);
      setSkipped(0);
      setDx(0);
      setFlying(null);
    }
  }, [deckSeed]);

  useEffect(() => () => {
    if (flyTimer.current) clearTimeout(flyTimer.current);
  }, []);

  const decide = useCallback(
    (direction) => {
      if (flying || cleared || !current) return;
      if (direction === "keep") {
        // Already in the pile: keeping it again is a no-op, but the card still
        // has to fly. Returning here instead left it stuck under the thumb with
        // a greyed button and no feedback — the only way past was to skip it.
        if (!kept.has(current.seed)) onKeep(current);
      } else {
        setSkipped((n) => n + 1);
      }
      setFlying(direction);
      setDragging(false);
      dragStart.current = null;
      flyTimer.current = setTimeout(() => {
        setCursor((c) => c + 1);
        setFlying(null);
        setDx(0);
      }, FLY_MS);
    },
    [flying, cleared, current, kept, onKeep],
  );

  // Thumb-speed keyboard: ← skip, → keep. This is a WINDOW listener, so it has
  // to defend itself — the panel stays mounted under the Map Editor overlay and
  // behind every modal, and an arrow key is a cursor move far more often than
  // it is a verdict.
  //
  // The old tag check (INPUT/TEXTAREA/SELECT) missed CodeMirror entirely: its
  // editable surface is a contenteditable <div>, so arrowing through your .jaml
  // silently skipped or kept the current seed — and preventDefault ate the
  // caret move too, so nothing looked like it had happened. isContentEditable
  // catches that class of editor; keyboardActive gates out overlay time.
  useEffect(() => {
    if (!keyboardActive) return undefined;
    const onKey = (e) => {
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (t && t.isContentEditable) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        decide("keep");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        decide("skip");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, keyboardActive]);

  const onPointerDown = (e) => {
    if (flying) return;
    dragStart.current = e.clientX;
    downTime.current = Date.now();
    draggingRef.current = true;
    setDragging(true);
    if (deckRef.current && deckRef.current.setPointerCapture) {
      try { deckRef.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
  };
  const onPointerMove = (e) => {
    if (!dragging || dragStart.current === null || flying) return;
    setDx(e.clientX - dragStart.current);
  };
  const onPointerUp = () => {
    if (!dragging || flying) return;
    setDragging(false);
    draggingRef.current = false;
    dragStart.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) decide(dx > 0 ? "keep" : "skip");
    else {
      setDx(0);
      // Tap (not a drag): open the seed's full story in the Jamlyze pane.
      if (current && Date.now() - downTime.current < 400) onSelect(current.seed);
    }
  };

  const reviewKept = () => {
    if (pileRef.current && pileRef.current.scrollIntoView) {
      pileRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  // Straight translation, no rotation. The card tracks the thumb and nothing
  // else — a tilt on a dense run card drags every sprite row off-axis with it.
  const offset = flying ? (flying === "keep" ? 420 : -420) : dx;
  const keepReady = current && !kept.has(current.seed);

  return (
    <div className="lab-panel lab-panel--results" data-screen-label="Results">
      <div className="lab-panel-head lab-panel-head--gold">
        {total === 0 ? 0 : Math.min(cursor, total)}/{total}
      </div>
      <div className="lab-panel-scroll j-results-scroll lab-triage">
        {total === 0 ? <div className="lab-empty">no results yet</div> : null}

        {cleared ? (
          <div className="lab-triage-cleared">
            <div className="lab-triage-cleared__msg">deck cleared — {kept.size} kept</div>
            {kept.size > 0 ? (
              <button type="button" className="j-btn j-btn--blue" onClick={reviewKept}>
                <span className="j-btn__face">review kept</span>
              </button>
            ) : null}
          </div>
        ) : null}

        {current ? (
          <div className="lab-triage-stage">
            <div
              ref={deckRef}
              className={
                "lab-triage-card" +
                (dragging ? " lab-triage-card--drag" : "") +
                (flying ? " lab-triage-card--fly" : "")
              }
              style={{ transform: `translate3d(${offset}px, 0, 0)` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {antes && antes.length ? (
                <div className="lab-triage-story">
                  <JamlyzeBody
                    antes={antes}
                    selectedAnte={selectedAnte}
                    onSelectAnte={setSelectedAnte}
                    watch={watch}
                  />
                </div>
              ) : (
                <div className="lab-triage-seed">{current.seed}</div>
              )}
              <div className="lab-triage-caption">
                {current.seed}
                <a
                  className="lab-triage-page"
                  href={"/jamlyze/" + current.seed}
                  target="_blank"
                  rel="noreferrer"
                  title={"Jamlyze " + current.seed + " — every ante, one page"}
                  onPointerDown={(e) => e.stopPropagation()}
                >↗ jamlyze</a>
              </div>
              <div className="lab-triage-score">+{Math.round(current.score).toLocaleString()}</div>
              {kept.has(current.seed) ? <div className="lab-triage-flag">already kept</div> : null}
            </div>

            <div className="lab-triage-actions">
              <button
                type="button"
                className="j-btn j-btn--red lab-triage-btn"
                onClick={() => decide("skip")}
                disabled={!!flying}
              >
                <span className="j-btn__face">Skip</span>
              </button>
              <button
                type="button"
                className={"j-btn lab-triage-btn " + (keepReady ? "j-btn--green" : "j-btn--grey j-btn--disabled")}
                onClick={() => decide("keep")}
                disabled={!keepReady || !!flying}
              >
                <span className="j-btn__face">Keep</span>
              </button>
            </div>
            <div className="lab-triage-hint">&rarr; keep / &larr; skip / tap opens Jamlyze</div>
            {skipped > 0 ? <div className="lab-triage-skipped">skipped {skipped}</div> : null}
          </div>
        ) : null}

        {kept.size > 0 ? (
          <div className="lab-triage-pile" ref={pileRef}>
            <div className="lab-triage-pile__label">kept pile · {kept.size}</div>
            <div className="lab-triage-pile__chips">
              {[...kept].map((seed) => (
                <button
                  key={seed}
                  type="button"
                  className={
                    "lab-triage-chip" + (seed === selectedSeed ? " lab-triage-chip--selected" : "")
                  }
                  onClick={() => onSelect(seed)}
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
