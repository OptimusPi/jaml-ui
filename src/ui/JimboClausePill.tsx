"use client";

import React, { type ReactNode } from "react";
import type { JimboZoneInput, JimboZoneKey } from "./zoneMeta.js";

export interface JimboClausePillProps {
  zone: JimboZoneInput;
  label: string;
  sprite?: ReactNode;
  /** Number of matches found; > 0 activates hit glow and badge. */
  matchCount?: number;
  title?: string;
  className?: string;
}

/**
 * Compact clause chip with sprite thumbnail and optional match-hit badge.
 * Used inside `JamlMapPreview` zone rails.
 */
export function JimboClausePill({
  zone,
  label,
  sprite,
  matchCount = -1,
  title,
  className,
}: JimboClausePillProps) {
  const normalized: JimboZoneKey = zone === "mustNot" ? "mustnot" : zone;
  const isHit = matchCount > 0;

  return (
    <div
      className={[
        "j-clause-pill",
        `j-clause-pill--${normalized}`,
        isHit ? "j-clause-pill--hit" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={title}
    >
      {sprite}
      <div className="j-clause-pill__label">{label}</div>
      {isHit ? (
        <div className="j-clause-pill__count">
          {matchCount > 1 ? `x${matchCount}` : "1"}
        </div>
      ) : null}
    </div>
  );
}
