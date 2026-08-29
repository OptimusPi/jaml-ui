import React from "react";
import { JimboMascot } from "jaml-ui";

/**
 * WelcomeMat — the front door. When the app opens with a seed-shaped string
 * on the clipboard, Jammy pops up over his usual spot and offers the one-tap:
 * "Analyze LOLAEFGT". One tap runs the Jamlyzer and brings its tab forward;
 * "nah" tucks the card away for the rest of the session.
 *
 * Rendered only when SeedLab actually has a clipboard seed to offer — no
 * clipboard, no card, no nagging. The card never blocks the panes behind it:
 * only its own surface takes pointer events.
 */
export function WelcomeMat({ seed, onAnalyze, onDismiss }) {
  if (!seed) return null;
  return (
    <div className="lab-welcome" role="dialog" aria-label="Seed on your clipboard">
      <div className="lab-welcome__card">
        <div className="lab-welcome__jammy" aria-hidden="true">
          <JimboMascot mood="happy" size={56} />
        </div>
        <div className="lab-welcome__body">
          <div className="lab-welcome__line">Psst — that seed on your clipboard?</div>
          <button
            type="button"
            className="j-btn j-btn--blue j-btn--full lab-welcome__go"
            onClick={() => onAnalyze(seed)}
            autoFocus
          >
            <span className="j-btn__face">Analyze {seed}</span>
          </button>
          {/* Modal law: the way out is a full-width orange Back, even off a
              friendly greeting card. */}
          <button type="button" className="j-btn j-btn--orange j-btn--full" onClick={onDismiss}>
            <span className="j-btn__face">Back</span>
          </button>
        </div>
      </div>
      <div className="lab-welcome__tail" aria-hidden="true" />
    </div>
  );
}
