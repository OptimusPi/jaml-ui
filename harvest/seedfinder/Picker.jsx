/**
 * Cascading add/edit-clause sheet: category tile -> searchable item grid ->
 * antes/score (+ small/big blind toggle for tags) -> commit. Faithful port
 * of JAML SeedLab.dc.html's picker, restyled onto real jimbo.css classes and
 * real jaml-ui sprite components instead of hand-rolled sprite-sheet CSS.
 *
 * Back button rule (CLAUDE.md): exactly "Back", full-width, always orange,
 * always the bottom-most element — one Back button either steps back a
 * cascade level or closes the sheet, never both at once.
 */
import React, { useEffect, useRef, useState } from "react";
import { CATEGORIES, ZONES } from "./catalog";
import { LabBackFoot } from "./LabBackFoot";
import { ItemTile } from "./ItemTile";

// Valid antes are 0-39: normal runs play 1-8, endless mode continues to 39
// (terminates on score overflow, not a hard cap). Ante 0 is a real,
// reachable ante — Hieroglyph/Petroglyph vouchers decrement the ante
// counter, so a run can actually be AT ante 0. The full range is
// selectable here, not just the normal 1-8 sweep.
const ANTES = Array.from({ length: 40 }, (_, i) => i);

// Item grid pages in chunks of 60 as you scroll (was a silent hard cap of
// 60 — anything past it simply didn't exist). A sentinel div at the bottom
// of the grid trips an IntersectionObserver rooted at .lab-picker-body.
const PAGE = 60;

export function Picker({ picker, onSelectCategory, onSelectItem, onQueryChange, onToggleAnte, onScoreDelta, onSetTagSlot, onBack, onClose, onCommit }) {
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const [resetKey, setResetKey] = useState("");
  const bodyRef = useRef(null);
  const sentinelRef = useRef(null);

  const query = (picker?.query || "").toLowerCase();
  const cat = picker?.catId ? CATEGORIES.find((c) => c.id === picker.catId) : null;
  const isItem = picker?.step === "item";
  const allItems = cat ? (query ? cat.names.filter((n) => n.toLowerCase().includes(query)) : cat.names) : [];
  const hasMore = visibleCount < allItems.length;
  const currentKey = `${picker?.catId ?? ""}|${query}`;

  // New category or new query → back to page one. This is the React-docs
  // "adjust state during render" pattern (not an effect), so it stays clear
  // of the react-hooks/set-state-in-effect rule this file family keeps
  // tripping.
  if (resetKey !== currentKey) {
    setResetKey(currentKey);
    setVisibleCount(PAGE);
  }

  useEffect(() => {
    if (!isItem || !hasMore) return;
    const body = bodyRef.current;
    const sentinel = sentinelRef.current;
    if (!body || !sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisibleCount((v) => v + PAGE);
      },
      { root: body, rootMargin: "240px" },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [isItem, hasMore, currentKey]);

  if (!picker) return null;
  const zoneMeta = ZONES[picker.zone];
  const isCat = picker.step === "cat";
  const isSettings = picker.step === "settings";
  const items = allItems.slice(0, visibleCount);
  const title = isCat ? "Pick type" : isItem ? (cat ? cat.label : "") : (picker.name || "—");
  const commitTone = picker.zone === "must" ? "j-btn--blue" : picker.zone === "should" ? "j-btn--red" : "j-btn--orange";

  return (
    <div className="lab-modal-overlay" onClick={onClose}>
      <div className={"lab-picker lab-tone-" + zoneMeta.tone} onClick={(e) => e.stopPropagation()}>
        <div className="lab-picker-head">
          <span className="lab-picker-zone">{zoneMeta.label}</span>
          <span className="lab-picker-title">{title}</span>
        </div>
        <div className="lab-picker-body" ref={bodyRef}>
          {isCat ? (
            <div className="lab-cat-grid">
              {CATEGORIES.map((c) => (
                <button key={c.id} type="button" className="lab-cat-tile" title={c.label} onClick={() => onSelectCategory(c.id)}>
                  <ItemTile kind={c.kind === "joker" ? "joker" : c.kind} name={c.names[0]} scale={0.23} className="lab-sprite lab-sprite--cat" />
                  <span className="lab-cat-tile-label">{c.label}</span>
                </button>
              ))}
            </div>
          ) : null}
          {isItem ? (
            <>
              <input
                className="lab-search"
                value={picker.query || ""}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="search..."
                autoFocus
              />
              <div className="lab-item-grid">
                {items.map((name) => (
                  <button key={name} type="button" className="lab-item-tile" title={name} onClick={() => onSelectItem(name)}>
                    <ItemTile kind={cat.kind} name={name} scale={0.33} className="lab-sprite lab-sprite--item" />
                  </button>
                ))}
                {items.length === 0 ? <div className="lab-empty">no matches</div> : null}
              </div>
              {hasMore ? (
                <div ref={sentinelRef} className="lab-item-sentinel">
                  {items.length} of {allItems.length} — scroll for more
                </div>
              ) : null}
            </>
          ) : null}
          {isSettings ? (
            <div className="lab-settings">
              <div className="lab-settings-preview">
                <ItemTile kind={picker.catId} name={picker.name} scale={0.47} className="lab-sprite lab-sprite--preview" />
                <span className="lab-settings-name">{picker.name}</span>
              </div>
              <div>
                <div className="lab-settings-label">SEARCH ANTES</div>
                <div className="lab-ante-row">
                  {ANTES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={"lab-ante-chip" + ((picker.antes || []).includes(n) ? " lab-ante-chip--on" : "")}
                      onClick={() => onToggleAnte(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {picker.catId === "tag" ? (
                <div>
                  <div className="lab-settings-label">WHICH BLIND</div>
                  <div className="lab-tag-slot-row">
                    <button
                      type="button"
                      className={"j-btn j-btn--full " + (picker.tagSlot !== "big" ? "j-btn--blue" : "j-btn--orange")}
                      onClick={() => onSetTagSlot("small")}
                    >
                      <span className="j-btn__face">Small Blind</span>
                    </button>
                    <button
                      type="button"
                      className={"j-btn j-btn--full " + (picker.tagSlot === "big" ? "j-btn--blue" : "j-btn--orange")}
                      onClick={() => onSetTagSlot("big")}
                    >
                      <span className="j-btn__face">Big Blind</span>
                    </button>
                  </div>
                </div>
              ) : null}
              {picker.zone === "should" ? (
                <div>
                  <div className="lab-settings-label">SCORE ON MATCH</div>
                  <div className="lab-score-row">
                    <button type="button" className="lab-score-btn" onClick={() => onScoreDelta(-1)}>&minus;</button>
                    <div className="lab-score-value">+{picker.score ?? 0}</div>
                    <button type="button" className="lab-score-btn" onClick={() => onScoreDelta(1)}>+</button>
                  </div>
                </div>
              ) : null}
              <button type="button" className={"j-btn j-btn--full " + commitTone} onClick={onCommit}>
                <span className="j-btn__face">{picker.editIndex != null ? "Update" : "Add"}</span>
              </button>
            </div>
          ) : null}
        </div>
        {/* CLAUDE.md: a "Back" button is always orange — no exception for
            "step back one cascade level" vs. "close the sheet", both are
            still exactly a Back button. */}
        <LabBackFoot onBack={picker.step !== "cat" ? onBack : onClose} />
      </div>
    </div>
  );
}
