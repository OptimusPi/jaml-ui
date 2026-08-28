"use client";

import React, { useMemo } from "react";
import type { MotelyJamlyzerSeedResult } from "motely-wasm";
import { JimboBox } from "../../ui/JimboBox.js";
import { JimboRow } from "../../ui/JimboLayout.js";
import { JimboBadge } from "../../ui/JimboBadge.js";
import { JimboSeedCopyChip } from "../../ui/JimboSeedCopyChip.js";
import { decodeMotelyItem } from "../../decode/motelyItemDecoder.js";
import {
  type JamlClause,
  matchMotelyItemToClause,
  matchClauseToAnte,
} from "../../lib/jaml/jaml.js";
import { voucherDisplayName, tagDisplayName } from "./names.js";
import { FiStar } from "react-icons/fi";

export interface JamlyzerSeedCardProps {
  result: MotelyJamlyzerSeedResult;
  selected?: boolean;
  pinned?: boolean;
  onSelect: () => void;
  onTogglePin?: (e: React.MouseEvent) => void;
  maxScore?: number;
  clauses?: JamlClause[];
  className?: string;
  style?: React.CSSProperties;
}

export interface SeedMilestoneHit {
  ante: number;
  label: string;
  tone: "green" | "orange" | "purple" | "blue" | "red";
}

export function extractSeedMilestones(
  result: MotelyJamlyzerSeedResult,
  clauses?: JamlClause[],
  maxMilestones = 3
): SeedMilestoneHit[] {
  const milestones: SeedMilestoneHit[] = [];

  // If clauses are provided, first extract specific clause matches
  if (clauses && clauses.length > 0) {
    for (const ante of result.antes) {
      if (milestones.length >= maxMilestones) break;
      for (const clause of clauses) {
        if (milestones.length >= maxMilestones) break;
        if (!matchClauseToAnte(clause, ante.ante)) continue;

        const allItems = [
          ...ante.shopItems,
          ...ante.packs.flatMap((p) => p.items),
          ...ante.pulls.judgementJokers,
          ...ante.pulls.wraithJokers,
          ...ante.pulls.emperorTarots,
          ...ante.pulls.purpleSealTarots,
          ...ante.pulls.sixthSenseSpectrals,
          ...ante.pulls.seanceSpectrals,
          ...ante.pulls.riffRaffJokers,
          ...ante.pulls.rareTagJokers,
          ...ante.pulls.uncommonTagJokers,
          ...ante.pulls.legendaryJokers,
        ];

        const matched = allItems.some((item) => {
          const decoded = decodeMotelyItem(item);
          return decoded ? matchMotelyItemToClause(decoded, clause) : false;
        });

        if (matched) {
          const alreadyHas = milestones.some(
            (m) => m.ante === ante.ante && m.label === clause.label
          );
          if (!alreadyHas) {
            milestones.push({
              ante: ante.ante,
              label: clause.label,
              tone: clause.kind === "should" ? "orange" : clause.kind === "must" ? "green" : "red",
            });
          }
        }
      }
    }
  }

  // Fallback / complement: highlight high-value items (Legendaries, The Soul, Vouchers in Ante 1-2)
  if (milestones.length < maxMilestones) {
    for (const ante of result.antes.slice(0, 3)) {
      if (milestones.length >= maxMilestones) break;

      // Legendary Jokers
      if (ante.pulls.legendaryJokers.length > 0) {
        const decoded = decodeMotelyItem(ante.pulls.legendaryJokers[0]);
        if (decoded?.displayName) {
          milestones.push({
            ante: ante.ante,
            label: `Legendary: ${decoded.displayName}`,
            tone: "purple",
          });
        }
      }

      // Vouchers
      if (ante.voucher && ante.ante === 1 && milestones.length < maxMilestones) {
        const vName = voucherDisplayName(ante.voucher);
        if (vName && vName !== "Unknown") {
          milestones.push({
            ante: 1,
            label: `Voucher: ${vName}`,
            tone: "blue",
          });
        }
      }

      // Early Rare Tags
      if (ante.smallBlindTag && ante.ante === 1 && milestones.length < maxMilestones) {
        const tName = tagDisplayName(ante.smallBlindTag);
        if (tName && (tName.includes("Rare") || tName.includes("Negative") || tName.includes("Polychrome") || tName.includes("Coupon"))) {
          milestones.push({
            ante: 1,
            label: `Tag: ${tName}`,
            tone: "green",
          });
        }
      }
    }
  }

  return milestones.slice(0, maxMilestones);
}

export function JamlyzerSeedCard({
  result,
  selected = false,
  pinned = false,
  onSelect,
  onTogglePin,
  clauses,
  className = "",
  style,
}: JamlyzerSeedCardProps) {
  const milestones = useMemo(
    () => extractSeedMilestones(result, clauses),
    [result, clauses]
  );

  const score = result.score ?? 0;
  const isMatch = score > 0;

  return (
    <JimboBox
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={[
        "j-jamlyzer-seed-card",
        selected ? "j-jamlyzer-seed-card--selected" : "",
        pinned ? "j-jamlyzer-seed-card--pinned" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <JimboRow gap="sm" align="center" justify="between" className="j-jamlyzer-seed-card__header">
        <JimboRow gap="xs" align="center">
          {onTogglePin && (
            <JimboBox
              role="button"
              tabIndex={0}
              title={pinned ? "Unpin seed" : "Pin seed to top"}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  onTogglePin(e as unknown as React.MouseEvent);
                }
              }}
              className={[
                "j-jamlyzer-pin-btn",
                pinned ? "j-jamlyzer-pin-btn--pinned" : "",
              ].join(" ")}
            >
              <FiStar />
            </JimboBox>
          )}
          <JimboSeedCopyChip value={result.seed} />
        </JimboRow>

        <JimboRow gap="xs" align="center">
          <JimboBadge
            size="sm"
            tone={isMatch ? "orange" : "grey"}
            className="j-jamlyzer-seed-card__score"
          >
            Score {score}
          </JimboBadge>
        </JimboRow>
      </JimboRow>

      {milestones.length > 0 && (
        <JimboRow wrap gap="xs" align="center" className="j-jamlyzer-seed-card__milestones">
          {milestones.map((m, idx) => (
            <JimboBadge key={idx} size="sm" tone={m.tone}>
              A{m.ante}: {m.label}
            </JimboBadge>
          ))}
        </JimboRow>
      )}
    </JimboBox>
  );
}
