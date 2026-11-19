"use client";

import React, { type ReactNode } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export interface JimboTallyBarProps {
  value: number;
  max: number;
  className?: string;
}

/**
 * Compact horizontal score bar parameterized via `--j-tally-pct`.
 */
export function JimboTallyBar({ value, max, className }: JimboTallyBarProps) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div
      className={["j-tally-bar", value > 0 ? "j-tally-bar--positive" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={{ "--j-tally-pct": `${pct * 100}%` } as React.CSSProperties}
    >
      <div className="j-tally-bar__fill" />
    </div>
  );
}

export interface JimboResultRowProps {
  seed: string;
  score?: number;
  maxScore?: number;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  tallyLabels?: string[];
  tallyColumns?: number[];
  preview?: ReactNode;
  className?: string;
}

/**
 * Expandable seed search result row with score bar, preview slot, and raw tally readout.
 */
export function JimboResultRow({
  seed,
  score,
  maxScore = 0,
  expandable = false,
  expanded = false,
  onToggle,
  tallyLabels,
  tallyColumns,
  preview,
  className,
}: JimboResultRowProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!expandable || !onToggle) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className={["j-result-row", expanded ? "j-result-row--open" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : -1}
        onClick={() => expandable && onToggle?.()}
        onKeyDown={handleKeyDown}
        className={[
          "j-result-row__trigger",
          expandable ? "j-result-row__trigger--interactive" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="j-result-row__seed">{seed}</span>

        {score !== undefined ? (
          <>
            <JimboTallyBar value={score} max={maxScore} />
            <span
              className={[
                "j-result-row__score",
                score > 0 ? "j-result-row__score--positive" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {score}
            </span>
          </>
        ) : null}

        {expandable ? (
          <span className="j-result-row__chevron" aria-hidden="true">
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        ) : null}
      </div>

      {expanded && expandable ? (
        <div className="j-result-row__detail">
          {preview}
          {tallyLabels && tallyColumns ? (
            <div className="j-result-row__tallies">
              <span className="j-result-row__tallies-heading">Raw Tally Data</span>
              {tallyLabels.map((label, i) => {
                const val = tallyColumns[i] ?? 0;
                if (val === 0) return null;
                return (
                  <div key={label} className="j-result-row__tally-line">
                    <span className="j-result-row__tally-label">{label}</span>
                    <span className="j-result-row__tally-val">{val}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
