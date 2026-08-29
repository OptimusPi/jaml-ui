import React from "react";
import { fmt } from "./format";

/**
 * The command deck, not a void: engine line up top, a real progress bar
 * with a number on it, compact stats, and a LIVE feed of hits as they
 * land — each one a tap away from its x-ray. Idle is honest empty state,
 * not a row of zeros.
 */
export function SearchPanel({ sps, checked, found, progressPct, engineLine, running, ready, onToggle, recentHits = [], selectedSeed, onSelect }) {
  const hasRun = running || checked > 0;
  const pct = Math.min(100, progressPct || 0);
  // A grind against a huge batch budget sits under 0.01% for millions of
  // seeds. "0.00%" next to a ticking CHECKED counter reads as broken, so a
  // started-but-tiny fraction says so literally.
  const pctLabel = pct >= 1 ? Math.floor(pct) + "%" : pct > 0 && pct < 0.01 ? "<0.01%" : pct.toFixed(2) + "%";
  return (
    <div className="lab-panel lab-panel--search" data-screen-label="Search">
      <div className="lab-search-body">
        <div className="lab-search-topline">
          <span className="lab-engine-line">{engineLine}</span>
          {hasRun ? <span className="lab-search-pct">{pctLabel}</span> : null}
        </div>
        {hasRun ? (
          <>
            <div className="j-progress"><div className="j-progress__track"><div className="j-progress__fill" style={{ width: pct + "%" }} /></div></div>
            <div className="lab-stat-row">
              <div className="j-stat"><div className="j-stat__label j-stat__label--blue">SPEED</div><div className="j-stat__value j-stat__value--blue">{fmt(sps)}</div></div>
              <div className="j-stat"><div className="j-stat__label j-stat__label--grey">CHECKED</div><div className="j-stat__value">{fmt(checked)}</div></div>
              {/* FOUND is deliberately NOT compact-formatted like the other two —
                  it's a small, exact "how many did you get" count, and the
                  original design used String(s.found), not fmt(s.found). */}
              <div className="j-stat"><div className="j-stat__label j-stat__label--green">FOUND</div><div className="j-stat__value j-stat__value--gold">{found}</div></div>
            </div>
          </>
        ) : null}
        {recentHits.length > 0 ? (
          <div className="lab-hits">
            <div className="lab-hits__label">LIVE HITS — tap to x-ray</div>
            <div className="lab-hits__list">
              {recentHits.map((h) => (
                <div key={h.seed} className={"lab-hit" + (h.seed === selectedSeed ? " lab-hit--active" : "")}>
                  <button
                    type="button"
                    className="lab-hit__main"
                    onClick={() => onSelect && onSelect(h.seed)}
                  >
                    <span className="lab-hit__seed">{h.seed}</span>
                    <span className="lab-hit__score">+{h.score}</span>
                  </button>
                  <a
                    className="lab-hit__page"
                    href={"/jamlyze/" + h.seed}
                    target="_blank"
                    rel="noreferrer"
                    title={"Jamlyze " + h.seed + " — every ante, one page"}
                  >↗</a>
                </div>
              ))}
            </div>
          </div>
        ) : hasRun ? (
          <div className="lab-hits__empty">Scanning — first hits land here.</div>
        ) : (
          <div className="lab-hits__empty">Start a search — hits land here live, newest on top.</div>
        )}
      </div>
      <div className="lab-search-foot">
        <button
          type="button"
          className={"j-btn j-btn--full " + (running ? "j-btn--red" : "j-btn--blue") + (!ready && !running ? " j-btn--disabled" : "")}
          disabled={!ready && !running}
          onClick={onToggle}
        >
          <span className="j-btn__face">{!ready ? "Booting…" : running ? "Stop Search" : "Start Search"}</span>
        </button>
      </div>
    </div>
  );
}
