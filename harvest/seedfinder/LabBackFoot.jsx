/**
 * The one true exit — Balatro's modal law, in one place.
 *
 * Closing out ANY modal container is ALWAYS an orange "Back" button spanning
 * the full width of that container, pinned at its very bottom — small modal,
 * large modal, full-screen takeover, all the same. The orange is deliberate
 * Balatro mockery (UX.md §2); RadialMenu's south pill is this same law on the
 * orbital ring. Extracted from the three modals that already obeyed it
 * (Picker, FilterBrowser, Settings) so the next surface can't drift.
 */
import React from "react";

export function LabBackFoot({ onBack }) {
  return (
    <div className="lab-picker-foot">
      <button type="button" className="j-btn j-btn--orange j-btn--full" onClick={onBack}>
        <span className="j-btn__face">Back</span>
      </button>
    </div>
  );
}
