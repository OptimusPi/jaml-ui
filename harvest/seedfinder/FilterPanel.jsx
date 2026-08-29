/**
 * FILTER quadrant: compact MUST/SHOULD/MUST NOT chip rows (sprite + name +
 * remove) with add buttons that open the picker. A smaller-footprint view of
 * the same clauses the Map Editor's zone rails show in full.
 */
import React from "react";
import { parseClauseBlocks } from "./jaml-clauses";
import { ItemTile } from "./ItemTile";
import { ZONES } from "./catalog";

const ZONE_ORDER = ["must", "should", "mustNot"];

export function FilterPanel({ jaml, jamlError, onAddClause, onRemoveClause, onOpenMap, onOpenBrowser }) {
  const groups = parseClauseBlocks(jaml);
  return (
    <div className="lab-panel lab-panel--filter" data-screen-label="Filter">
      <div className="lab-filter-map-row">
        <button type="button" className="j-btn j-btn--grey j-btn--full" onClick={onOpenMap}>
          <span className="j-btn__face lab-btn-face-sm">JAML + Map Editor</span>
        </button>
        <button type="button" className="j-btn j-btn--blue j-btn--full" onClick={onOpenBrowser}>
          <span className="j-btn__face lab-btn-face-sm">Browse Filters</span>
        </button>
      </div>
      <div className="lab-panel-scroll lab-filter-rows">
        {ZONE_ORDER.map((zone) => (
          <div key={zone} className="lab-chip-row">
            <span className={"lab-chip-row-label lab-tone-" + ZONES[zone].tone}>{ZONES[zone].label}</span>
            {groups[zone].map((c, i) => (
              <span key={zone + i + c.name} className="lab-chip">
                <ItemTile kind={c.kind} name={c.name} scale={0.17} className="lab-sprite lab-sprite--chip" />
                <span className="lab-chip-label">{c.name}</span>
                <button type="button" className="lab-chip-remove" onClick={() => onRemoveClause(zone, i)}>&times;</button>
              </span>
            ))}
          </div>
        ))}
      </div>
      {jamlError ? (
        <div className="lab-filter-status">
          <span className="lab-filter-status--error">{"JAML error: " + jamlError}</span>
        </div>
      ) : null}
      <div className="lab-filter-actions">
        <button type="button" className="j-btn j-btn--blue j-btn--full" onClick={() => onAddClause("must")}>
          <span className="j-btn__face lab-btn-face-sm">Need</span>
        </button>
        <button type="button" className="j-btn j-btn--red j-btn--full" onClick={() => onAddClause("should")}>
          <span className="j-btn__face lab-btn-face-sm">Bonus</span>
        </button>
        <button type="button" className="j-btn j-btn--orange j-btn--full" onClick={() => onAddClause("mustNot")}>
          <span className="j-btn__face lab-btn-face-sm">Avoid</span>
        </button>
      </div>
    </div>
  );
}
