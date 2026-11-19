"use client";

import React, { type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { JimboIconButton } from "./JimboIconButton.js";
import { JIMBO_ZONE_META, type JimboZoneInput, type JimboZoneKey } from "./zoneMeta.js";

export interface JimboClauseCardProps {
  zone: JimboZoneInput;
  label: string;
  sprite?: ReactNode;
  antes?: number[];
  score?: number;
  onRemove?: () => void;
  onEdit?: () => void;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  className?: string;
}

/**
 * Interactive clause card for the visual JAML builder (`JamlIdeVisual`).
 */
export function JimboClauseCard({
  zone,
  label,
  sprite,
  antes,
  score,
  onRemove,
  onEdit,
  onDragStart,
  className,
}: JimboClauseCardProps) {
  const normalized: JimboZoneKey = zone === "mustNot" ? "mustnot" : zone;

  return (
    <div
      onClick={onEdit}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      className={["j-clause-card", `j-clause-card--${normalized}`, className].filter(Boolean).join(" ")}
    >
      <div className="j-clause-card__sprite">{sprite}</div>
      <div className="j-clause-card__body">
        <div className="j-clause-card__label">{label}</div>
        <div className="j-clause-card__meta">
          {antes && antes.length > 0 ? (
            <>
              <div className="j-clause-card__ante-prefix">A</div>
              {antes.map((a) => (
                <div key={a} className="j-clause-card__ante-chip">
                  {a}
                </div>
              ))}
            </>
          ) : null}
          {normalized === "should" && score != null ? (
            <div className="j-clause-card__score">+{score}</div>
          ) : null}
        </div>
      </div>
      {onRemove ? (
        <JimboIconButton
          size="xs"
          tone="destructive"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
        >
          <FiX />
        </JimboIconButton>
      ) : null}
    </div>
  );
}

export interface JimboAddSlotTileProps {
  zone: JimboZoneInput;
  onTap?: () => void;
  className?: string;
}

/**
 * Dashed "?" mystery tile used at the bottom of a `JimboZoneRail` to add a new clause.
 */
export function JimboAddSlotTile({ zone, onTap, className }: JimboAddSlotTileProps) {
  const normalized: JimboZoneKey = zone === "mustNot" ? "mustnot" : zone;
  const meta = JIMBO_ZONE_META[normalized];

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!onTap}
      className={[
        "j-add-slot-tile",
        `j-add-slot-tile--${normalized}`,
        onTap ? "j-add-slot-tile--interactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="j-add-slot-tile__glyph">?</span>
      <span className="j-add-slot-tile__label">Add to {meta.label}</span>
    </button>
  );
}

export interface JimboDragGhostProps {
  x: number;
  y: number;
  children: ReactNode;
}

/**
 * Fixed-position drag ghost overlay positioned via `--j-drag-x` / `--j-drag-y`.
 */
export function JimboDragGhost({ x, y, children }: JimboDragGhostProps) {
  return (
    <div
      className="j-drag-ghost"
      style={{ "--j-drag-x": `${x}px`, "--j-drag-y": `${y}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
