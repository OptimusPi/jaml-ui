"use client";

import React, { type ReactNode } from "react";
import { JIMBO_ZONE_META, normalizeJimboZone, type JimboZoneInput } from "./zoneMeta.js";

export interface JimboZoneRailProps {
  zone: JimboZoneInput;
  count: number;
  /** "preview" renders dashed border + wrap grid (map preview); "editor" renders solid border + stacked cards + hint (visual IDE). */
  variant?: "preview" | "editor";
  compact?: boolean;
  /** Override default hint text; pass `false` to hide in editor variant. */
  hint?: string | false;
  emptyText?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Shared zone container for JAML Must / Should / Must Not sections.
 * Used by both `JamlMapPreview` and `JamlIdeVisual`.
 */
export function JimboZoneRail({
  zone,
  count,
  variant = "editor",
  compact = false,
  hint,
  emptyText,
  className,
  children,
}: JimboZoneRailProps) {
  const normalized = normalizeJimboZone(zone);
  const meta = JIMBO_ZONE_META[normalized];
  const resolvedHint = hint === false ? null : (hint ?? (variant === "editor" ? meta.hint : null));

  const classes = [
    "j-zone-rail",
    `j-zone-rail--${normalized}`,
    `j-zone-rail--${variant}`,
    compact ? "j-zone-rail--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div data-zone={normalized} className={classes}>
      <div className="j-zone-rail__head">
        <div className="j-zone-rail__tag">{meta.label}</div>
        <div className="j-zone-rail__rule" />
        <div className="j-zone-rail__count">{count}</div>
      </div>

      {resolvedHint ? <div className="j-zone-rail__hint">{resolvedHint}</div> : null}

      <div className={variant === "preview" ? "j-zone-rail__items--wrap" : "j-zone-rail__items--stack"}>
        {count === 0 && emptyText ? (
          <div className="j-zone-rail__empty">{emptyText}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
