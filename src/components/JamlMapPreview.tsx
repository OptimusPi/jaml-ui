"use client";

import React, { useMemo } from "react";
import { JimboColorOption } from "../ui/tokens.js";
import { JimboZone } from "../ui/jimboZone.js";
import { JimboSpritePill } from "../ui/jimboSpritePill.js";
import { JimboText } from "../ui/jimboText.js";
import type { SpriteSheetType } from "../sprites/spriteMapper.js";
import {
  extractVisualJamlItems,
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
      <div className={`j-map-preview__empty ${className}`.trim()} data-compact={compact}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`j-map-preview ${className}`.trim()} data-compact={compact}>
      {SECTION_ORDER.map((section) => {
        const meta = ZONES[section];
        const items = groups[section];
        return (
          <JimboZone
            key={section}
            label={meta.label}
            color={meta.color}
            count={items.length}
            compact={compact}
          >
            {items.length === 0 ? (
              <JimboText size="label" tone="grey" className="j-zone-rail__empty">
                drop clauses here
              </JimboText>
            ) : (
              items.map((item) => {
                // The engine labels look like "must: joker: Blueprint" or
                // "must: rareJoker: Blueprint" — match item value + section.
                const labelKey = `${item.section}: ${item.clauseKey}: ${item.value}`;
                const count = matchMap[labelKey] ?? -1;
                return (
                  <JimboSpritePill
                    key={item.id}
                    spriteName={item.value}
                    sheet={SHEET_FOR_VISUAL[item.visualType]}
                    label={item.value}
                    glow={meta.glow}
                    matchCount={count}
                    title={`${item.clauseKey}: ${item.value}${count >= 0 ? ` (Found: ${count})` : ""}`}
                  />
                );
              })
            )}
          </JimboZone>
        );
      })}
    </div>
  );
}
