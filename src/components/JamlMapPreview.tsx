"use client";

import React, { useMemo } from "react";
import { JimboSprite } from "../ui/sprites.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JimboZoneRail } from "../ui/JimboZoneRail.js";
import { JimboClausePill } from "../ui/JimboClausePill.js";
import type { SpriteSheetType } from "../sprites/spriteMapper.js";
import {
  extractVisualJamlItems,
  type JamlPreviewSection,
  type JamlPreviewVisualType,
} from "../utils/jamlMapPreview.js";

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
      <JimboBox
        className={[
          "j-map-preview__empty",
          compact ? "j-map-preview__empty--compact" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {emptyMessage}
      </JimboBox>
    );
  }

  return (
    <JimboBox
      className={[
        "j-map-preview",
        compact ? "j-map-preview--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {SECTION_ORDER.map((section) => {
        const items = groups[section];
        return (
          <JimboZoneRail
            key={section}
            zone={section}
            variant="preview"
            compact={compact}
            count={items.length}
            emptyText="drop clauses here"
          >
            {items.map((item) => {
              const labelKey = `${item.section}: ${item.clauseKey}: ${item.value}`;
              const count = matchMap[labelKey] ?? -1;
              const hasData = count >= 0;

              return (
                <JimboClausePill
                  key={item.id}
                  zone={section}
                  label={item.value}
                  matchCount={count}
                  title={`${item.clauseKey}: ${item.value}${hasData ? ` (Found: ${count})` : ""}`}
                  sprite={
                    <JimboSprite
                      name={item.value}
                      sheet={SHEET_FOR_VISUAL[item.visualType]}
                      width={26}
                    />
                  }
                />
              );
            })}
          </JimboZoneRail>
        );
      })}
    </JimboBox>
  );
}
