"use client";

import type { ReactNode } from "react";
import { JimboButton } from "./JimboButton.js";
import { JimboText } from "./jimboText.js";

export interface JimboPanelSpinnerProps {
  label?: string;
  title: string;
  description?: string;
  media?: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  className?: string;
}

/** Fat Balatro option cycler: 140px arrows flanking a fixed-height face. */
export function JimboPanelSpinner({
  label,
  title,
  description,
  media,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  className = "",
}: JimboPanelSpinnerProps) {
  return (
    <div className={["j-panel-spinner", className].filter(Boolean).join(" ")}>
      {label ? (
        <div className="j-panel-spinner__label">
          <JimboText size="sm" tone="white">
            {label}
          </JimboText>
        </div>
      ) : null}
      <div className="j-panel-spinner__row">
        <JimboButton
          tone="red"
          size="sm"
          className="j-panel-spinner__arrow j-panel-spinner__arrow--left"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label={`Previous ${label ?? title}`}
        >
          {"<"}
        </JimboButton>
        <div className="j-panel-spinner__panel">
          {media ? <div className="j-panel-spinner__media">{media}</div> : null}
          <div className="j-panel-spinner__title">
            <JimboText size="md" tone="white">
              {title}
            </JimboText>
          </div>
          {description ? (
            <div className="j-panel-spinner__description">
              <JimboText size="xs" tone="grey">
                {description}
              </JimboText>
            </div>
          ) : null}
        </div>
        <JimboButton
          tone="red"
          size="sm"
          className="j-panel-spinner__arrow j-panel-spinner__arrow--right"
          onClick={onNext}
          disabled={!canNext}
          aria-label={`Next ${label ?? title}`}
        >
          {">"}
        </JimboButton>
      </div>
    </div>
  );
}
