/**
 * Standalone Jamlyze pane: seed input + jaml-ui's real JamlyzerView — the
 * clause-linked breakdown (scoreboard rail, hover highlighting, sprite
 * cards, score, erratic deck, events). Distinct from JamlyzePanel.jsx's
 * JamlyzeBody, which stays as the Results Run Card's compact triage story
 * (ResultsPanel.jsx) and is untouched here.
 */
import React from "react";
import { JamlyzerView } from "jaml-ui";

export function JamlyzeAnalyzer({
  jaml, seedVal, onSeedInput, result, analyzeMsg, deck, stake, clipSeed, onClipAnalyze,
}) {
  return (
    <div className="lab-panel lab-panel--jamlyze" data-screen-label="Jamlyze">
      <div className="lab-jamlyze-seed-row">
        <input
          className="j-seed-input__field lab-jamlyze-seed-input"
          value={seedVal}
          onChange={(e) => onSeedInput(e.target.value)}
          maxLength={8}
          placeholder="SEED"
        />
      </div>
      <div className="lab-jamlyze-scroll">
        {result ? (
          <JamlyzerView result={result} jamlText={jaml} deck={deck} stake={stake} />
        ) : (
          <div className="lab-empty">
            {clipSeed ? (
              <button type="button" className="jam-clip-chip" onClick={() => onClipAnalyze && onClipAnalyze(clipSeed)}>
                seed in clipboard — tap to analyze {clipSeed}
              </button>
            ) : null}
            <div>{analyzeMsg || "enter a seed — real motely analysis"}</div>
          </div>
        )}
      </div>
    </div>
  );
}
