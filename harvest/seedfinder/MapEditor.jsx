/**
 * Full-screen overlay: MUST/SHOULD/MUST NOT visual zone rails (real sprite
 * cards, ante chips, score badges) side by side with the live, directly
 * editable .jaml text — same document, two views. The zone rails call
 * jaml-clauses.js's targeted line-splice ops so editing there never disturbs
 * a clause's `sources:` sub-block or any other clause's text.
 *
 * Visual Map is the deliberate exception. jaml-ui's JamlMapEditor is a
 * GENERATOR, not an editor: it keeps its slot picks in private state with no
 * prop to seed them and no way to read them back, and its buildJamlText()
 * regenerates a whole self-contained document on every tap — hardcoding
 * `name: My Custom Seed Map`, `author: JamlBuilder`, `deck: Red`,
 * `stake: White`, and emitting no `sources:` sub-blocks at all. Its output
 * therefore cannot be merged into the live document, only substituted for it.
 * So it is staged in a local buffer and applied by one explicit Replace
 * button, instead of letting every tap quietly overwrite the shared draft.
 */
import React, { useState, useCallback } from "react";
import { JamlMapEditor as JamlUiMapEditor } from "jaml-ui";
import { ZONES } from "./catalog";
import { ItemTile } from "./ItemTile";
import { parseClauseBlocks } from "./jaml-clauses";
import { JamlCodePane } from "./JamlCodePane";
import { LabBackFoot } from "./LabBackFoot";

const ZONE_ORDER = ["must", "should", "mustNot"];

export function MapEditor({ open, narrow, jaml, codeDraft, codeError, onDraftChange, onApplyDraft, onClose, onAddClause, onEditClause, onRemoveClause, onReplaceFilter }) {
  const groups = parseClauseBlocks(jaml);
  const [mode, setMode] = useState("visual");

  // Staged Visual Map output — see the module header for why it never goes
  // straight to the shared draft. Bumping visualKey remounts the generator
  // for "start over"; nothing else resets it, so slot picks survive tab
  // switches and Zone List edits alike.
  const [visualDraft, setVisualDraft] = useState(null);
  const [visualKey, setVisualKey] = useState(0);

  const startOver = useCallback(() => {
    setVisualDraft(null);
    setVisualKey((k) => k + 1);
  }, []);

  // Hands the staged text over in one shot: the parent validates it, swaps the
  // document, and clears the deck+pile the old filter produced. Going through
  // onDraftChange+onApplyDraft instead would commit before validating and leave
  // an invalid draft sitting against the still-live old jaml.
  const replaceWithVisual = useCallback(() => {
    if (visualDraft == null) return;
    onReplaceFilter(visualDraft);
  }, [visualDraft, onReplaceFilter]);

  const visualMode = mode === "visual";
  // On a phone the old fixed two-column body squeezed the zone rails into an
  // unreadable ~50px sliver and clipped the code pane's own label. One pane at
  // a time instead, with .JAML promoted from a permanently-half-width column
  // to a first-class tab — it is a main view of the filter, not a side panel.
  const codeMode = narrow && mode === "code";
  const showRails = !visualMode && !codeMode;
  const showCode = !narrow || codeMode;

  return (
    <div className={"lab-map-overlay" + (open ? "" : " lab-map-overlay--hidden")}>
      <div className="lab-map-head">
        <div className="j-wordmark__title lab-map-title">JAML MAP EDITOR</div>
        <div className="lab-map-mode-tabs">
          <button
            type="button"
            className={"lab-map-mode-tab" + (mode === "zones" ? " lab-map-mode-tab--active" : "")}
            onClick={() => setMode("zones")}
          >
            Zone List
          </button>
          <button
            type="button"
            className={"lab-map-mode-tab" + (visualMode ? " lab-map-mode-tab--active" : "")}
            onClick={() => setMode("visual")}
          >
            Visual Map
          </button>
          {narrow ? (
            <button
              type="button"
              className={"lab-map-mode-tab" + (codeMode ? " lab-map-mode-tab--active" : "")}
              onClick={() => setMode("code")}
            >
              .JAML
            </button>
          ) : null}
        </div>
      </div>
      <div className={"lab-map-body" + (narrow ? " lab-map-body--narrow" : "")}>
        {/* Always mounted, hidden via CSS rather than unmounted: the generator
            owns its slot picks in local state with no way to seed them back,
            so unmounting on tab-switch would wipe whatever was tapped in. */}
        <div className={"lab-map-visual lab-map-visual--slots" + (visualMode ? "" : " lab-map-visual--hidden")}>
          {visualDraft != null && (
            <div className="lab-map-visual-notice">
              Preview only — nothing applied yet. Replace Filter swaps your whole
              document for this one: name, deck and stake reset to the builder&apos;s
              defaults, sources: blocks are dropped, your results and kept pile
              clear, and any clause you tapped into 8 or more antes is written as
              every ante. Check the preview before you commit it.
            </div>
          )}
          <JamlUiMapEditor key={visualKey} onChange={setVisualDraft} />
        </div>
        {showRails && (
        <div className="lab-map-visual">
          {ZONE_ORDER.map((zoneKey) => {
            const meta = ZONES[zoneKey];
            const clauses = groups[zoneKey];
            return (
              <div key={zoneKey} className={"lab-map-zone lab-tone-" + meta.tone}>
                <div className="lab-map-zone-head">
                  <div className="lab-zone-pill">{meta.label}</div>
                  <div className="lab-zone-rule" />
                  <div className="lab-zone-count">{clauses.length}</div>
                </div>
                <div className="lab-zone-hint">{meta.hint}</div>
                <div className="lab-zone-clauses">
                  {clauses.map((c, i) => (
                    <div
                      key={zoneKey + i + c.name}
                      className="lab-clause-card"
                      onClick={() => onEditClause(zoneKey, i)}
                    >
                      <ItemTile kind={c.kind} name={c.name} scale={0.31} className="lab-sprite lab-sprite--clause" />
                      <div className="lab-clause-info">
                        <div className="lab-clause-name">{c.name}</div>
                        <div className="lab-clause-badges">
                          {(c.antes || []).map((a) => (
                            <span key={a} className="lab-ante-badge">{a}</span>
                          ))}
                          {zoneKey === "should" && c.score != null ? <span className="lab-score-badge">+{c.score}</span> : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="lab-clause-remove"
                        onClick={(e) => { e.stopPropagation(); onRemoveClause(zoneKey, i); }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button type="button" className="lab-zone-add" onClick={() => onAddClause(zoneKey)}>
                    ADD TO {meta.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
        {showCode ? (
        <div className="lab-map-code">
          <div className="lab-map-code-head">
            <span className="lab-map-code-label">
              {visualMode
                ? (visualDraft != null ? ".JAML — Visual Map preview" : ".JAML — tap a slot to start building")
                : ".JAML — live, editable"}
            </span>
            {visualMode ? (
              <div className="lab-map-code-actions">
                <button
                  type="button"
                  className="j-btn j-btn--grey"
                  onClick={startOver}
                  disabled={visualDraft == null}
                >
                  <span className="j-btn__face lab-btn-face-sm">Start Over</span>
                </button>
                <button
                  type="button"
                  className="j-btn j-btn--red"
                  onClick={replaceWithVisual}
                  disabled={visualDraft == null}
                >
                  <span className="j-btn__face lab-btn-face-sm">Replace Filter</span>
                </button>
              </div>
            ) : (
              <button type="button" className="j-btn j-btn--green" onClick={onApplyDraft}>
                <span className="j-btn__face lab-btn-face-sm">Apply</span>
              </button>
            )}
          </div>
          {/* In Visual Map the pane previews the staged generator output, not
              the live draft — read-only because the generator rebuilds it from
              scratch on the next tap, so keystrokes here could not survive.
              The write-back callbacks come off entirely while previewing: the
              preview must not be able to reach the shared draft by any route,
              and Replace Filter stays the only way its text gets committed. */}
          <JamlCodePane
            value={visualMode ? (visualDraft ?? "") : codeDraft}
            onChange={visualMode ? undefined : onDraftChange}
            onBlur={visualMode ? undefined : onApplyDraft}
            readOnly={visualMode}
          />
          {codeError ? <div className="lab-map-code-error">{codeError}</div> : null}
        </div>
        ) : null}
      </div>
      {/* Modal law: the overlay's exit is a full-width orange Back pinned to
          its bottom edge — the head keeps only title and mode tabs. */}
      <LabBackFoot onBack={onClose} />
    </div>
  );
}
