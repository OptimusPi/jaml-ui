"use client";

import React, { useMemo } from "react";
import { JimboSprite } from "../ui/sprites.js";
import { JimboColorOption } from "../ui/tokens.js";
import { JimboBox } from "../ui/JimboBox.js";
import type { SpriteSheetType } from "../sprites/spriteMapper.js";
import {
  extractVisualJamlItems,
  type JamlPreviewItem,
  type JamlPreviewSection,
  type JamlPreviewVisualType,
} from "../utils/jamlMapPreview.js";

const C = JimboColorOption;

export interface JamlMapPreviewProps {
  /** The raw JAML string to parse and visualize. */
  jaml: string;
  className?: string;
  emptyMessage?: string;
  tallyColumns?: number[];
  tallyLabels?: string[];
  /** Reduces padding and sizes for sidebar/explorer usage. */
  compact?: boolean;
}

const ZONES: Record<JamlPreviewSection, { label: string; color: string; glow: string }> = {
  must: { label: "Must", color: C.BLUE, glow: C.BLUE },
  should: { label: "Should", color: C.RED, glow: C.GOLD },
  mustNot: { label: "Must Not", color: C.ORANGE, glow: C.ORANGE },
};

const SECTION_ORDER: JamlPreviewSection[] = ["must", "should", "mustNot"];

const SHEET_FOR_VISUAL: Record<JamlPreviewVisualType, SpriteSheetType> = {
  joker: "Jokers",
  consumable: "Tarots",
  voucher: "Vouchers",
  tag: "tags",
  boss: "BlindChips",
};

export function ClausePill({ 
  item, 
  glow, 
  matchCount 
}: { 
  item: JamlPreviewItem; 
  glow: string; 
  matchCount: number;
}) {
  const isHit = matchCount > 0;
  const hasData = matchCount !== undefined && matchCount >= 0;

  return (
    <JimboBox
      className={isHit ? "j-map-preview-pill j-map-preview-pill--hit" : "j-map-preview-pill"}
      style={{
        "--j-map-pill-bg": isHit ? `${glow}33` : "var(--j-darkest)",
        "--j-map-pill-border": isHit ? glow : "var(--j-panel-edge)",
        "--j-map-pill-opacity": isHit ? 1 : 0.6,
        "--j-map-pill-anim": isHit ? "j-glow-pulse 1.6s ease-in-out infinite" : "none",
      } as React.CSSProperties}
      title={`${item.clauseKey}: ${item.value}${hasData ? ` (Found: ${matchCount})` : ""}`}
    >
      <JimboSprite 
        name={item.value} 
        sheet={SHEET_FOR_VISUAL[item.visualType]} 
        width={26} 
      />
      <JimboBox className="j-map-preview-pill-text">
        {item.value}
      </JimboBox>
      {isHit && (
        <JimboBox className="j-map-preview-hit-count">
          {matchCount > 1 ? `x${matchCount}` : "1"}
        </JimboBox>
      )}
    </JimboBox>
  );
}


export function ZoneRail({ 
  zone, 
  items, 
  matchMap,
  compact = false
}: { 
  zone: JamlPreviewSection; 
  items: JamlPreviewItem[];
  matchMap: Record<string, number>;
  compact?: boolean;
}) {
  const meta = ZONES[zone];
  return (
    <JimboBox
      className={`j-map-preview-rail ${compact ? "j-map-preview-rail--compact" : "j-map-preview-rail--normal"}`}
      style={{
        "--j-map-rail-color": `${meta.color}55`,
      } as React.CSSProperties}
    >
      <JimboBox className="j-map-preview-rail-header">
        <JimboBox
          className={`j-map-preview-rail-label ${compact ? "j-map-preview-rail-label--compact" : "j-map-preview-rail-label--normal"}`}
          style={{ "--j-map-rail-bg": meta.color } as React.CSSProperties}
        >
          {meta.label}
        </JimboBox>
        <JimboBox 
          className="j-map-preview-rail-line"
          style={{ "--j-map-rail-line-bg": `${meta.color}44` } as React.CSSProperties} 
        />
        <JimboBox className="j-map-preview-rail-count">{items.length}</JimboBox>
      </JimboBox>
      <JimboBox className="j-map-preview-items">
        {items.length === 0 ? (
          <JimboBox className="j-map-preview-empty">
            drop clauses here
          </JimboBox>
        ) : (
          items.map((item) => {
            // Match logic: the engine labels usually look like "must: joker: Blueprint"
            // or "must: rareJoker: Blueprint". We try to match the item value and section.
            const labelKey = `${item.section}: ${item.clauseKey}: ${item.value}`;
            const count = matchMap[labelKey] ?? -1;

            return (
              <ClausePill 
                key={item.id} 
                item={item} 
                glow={meta.glow}
                matchCount={count}
              />
            );
          })
        )}
      </JimboBox>
    </JimboBox>
  );
}

export function JamlMapPreview({
  jaml,
  className = "",
  emptyMessage = "No visual JAML clauses found yet.",
  tallyColumns,
  tallyLabels,
  compact = false,
}: JamlMapPreviewProps) {
  const groups = useMemo(() => extractVisualJamlItems(jaml), [jaml]);
  const totalItems = SECTION_ORDER.reduce((sum, s) => sum + groups[s].length, 0);

  const matchMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (tallyColumns && tallyLabels) {
      tallyLabels.forEach((label, i) => {
        map[label] = tallyColumns[i] ?? 0;
      });
    }
    return map;
  }, [tallyColumns, tallyLabels]);

  if (totalItems === 0) {
    return (
      <JimboBox
        className={`${className} j-map-preview-root-empty ${compact ? "j-map-preview-root-empty--compact" : "j-map-preview-root-empty--normal"}`.trim()}
      >
        {emptyMessage}
      </JimboBox>
    );
  }

  return (
    <JimboBox
      className={`${className} j-map-preview-root ${compact ? "j-map-preview-root--compact" : "j-map-preview-root--normal"}`.trim()}
    >
      {SECTION_ORDER.map((section) => (
        <ZoneRail 
          key={section} 
          zone={section} 
          items={groups[section]} 
          matchMap={matchMap}
          compact={compact}
        />
      ))}
    </JimboBox>
  );
}
