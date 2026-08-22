"use client";

import React, { useState } from "react";
import { type DailyRitual, parseRitual } from "../lib/daily/ritual.js";
import { JimboPanel } from "../ui/JimboPanel.js";
import { JimboInnerPanel } from "../ui/panel.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboBadge } from "../ui/JimboBadge.js";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboRow, JimboStack } from "../ui/JimboLayout.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JamlGameCard } from "./GameCard.js";
import { StandardCard } from "./StandardCard.js";
import { CardRank, CardSuit } from "./cardEnums.js";
import { FiPlay, FiCode, FiCheck, FiCopy } from "react-icons/fi";

export interface DailyRitualViewProps {
  /** The ritual to render. Provide this or {@link jaml}; `ritual` wins if both are given. */
  ritual?: DailyRitual;
  /** Raw JAML source; parsed into a ritual when `ritual` is not supplied. */
  jaml?: string;
  /** Which day this is, for the header badge. Runtime info, not part of the ritual file. */
  dayNumber?: number;
  /** Formatted date for the header badge, e.g. "Fri, Aug 21". */
  dateString?: string;
  onLoadJaml?: (jaml: string) => void;
  onPlayRitual?: (ritual: DailyRitual) => void;
  className?: string;
  style?: React.CSSProperties;
}

const RANK_MAP: Record<string, CardRank> = {
  "2": CardRank.Two,
  "3": CardRank.Three,
  "4": CardRank.Four,
  "5": CardRank.Five,
  "6": CardRank.Six,
  "7": CardRank.Seven,
  "8": CardRank.Eight,
  "9": CardRank.Nine,
  "10": CardRank.Ten,
  J: CardRank.Jack,
  Q: CardRank.Queen,
  K: CardRank.King,
  A: CardRank.Ace,
};

export function DailyRitualView({
  ritual: ritualProp,
  jaml,
  dayNumber,
  dateString,
  onLoadJaml,
  onPlayRitual,
  className = "",
  style,
}: DailyRitualViewProps) {
  const [ritual] = useState<DailyRitual>(
    () => ritualProp ?? parseRitual(jaml ?? "")
  );
  const [copied, setCopied] = useState(false);

  const handleCopyJaml = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ritual.jaml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Non-fatal
    }
  };

  const focusCardRank = ritual.focusRank ? RANK_MAP[ritual.focusRank] : undefined;

  return (
    <JimboPanel
      title={dayNumber != null ? `Daily Ritual · Day #${dayNumber}` : "Daily Ritual"}
      tone="gold"
      className={["j-daily-ritual", className].filter(Boolean).join(" ")}
      style={style}
    >
      <JimboStack gap="md" align="stretch">
        {/* ── Ritual Hero Header ───────────────────────────────────────────── */}
        <JimboInnerPanel className="j-daily-ritual__hero">
          <JimboRow wrap gap="md" align="center" justify="between">
            <JimboStack gap="xs" align="start">
              <JimboRow gap="xs" align="center">
                {dayNumber != null && (
                  <JimboBadge size="sm" tone="orange">
                    Day #{dayNumber}
                  </JimboBadge>
                )}
                {dateString && (
                  <JimboBadge size="sm" tone="blue">
                    {dateString}
                  </JimboBadge>
                )}
                {ritual.theme && (
                  <JimboBadge size="sm" tone="green">
                    {ritual.theme}
                  </JimboBadge>
                )}
              </JimboRow>
              <JimboText size="lg" tone="gold" className="j-daily-ritual__title">
                {ritual.title}
              </JimboText>
              {ritual.description && (
                <JimboText size="xs" tone="white">
                  {ritual.description}
                </JimboText>
              )}
            </JimboStack>

            {/* Visual Card Sprites (Target Joker + Focus Rank) */}
            <JimboBox className="j-daily-ritual__cards">
              <JimboRow gap="sm" align="center">
                {ritual.targetJoker && (
                  <JimboBox className="j-daily-ritual__card-wrap">
                    <JamlGameCard
                      card={{ name: ritual.targetJoker, scale: 0.8 }}
                      type="joker"
                    />
                  </JimboBox>
                )}
                {focusCardRank && (
                  <JimboBox className="j-daily-ritual__card-wrap">
                    <StandardCard
                      rank={focusCardRank}
                      suit={CardSuit.Spades}
                      size={52}
                    />
                  </JimboBox>
                )}
              </JimboRow>
            </JimboBox>
          </JimboRow>
        </JimboInnerPanel>

        {/* ── Flavor & Strategy Hints ─────────────────────────────────────── */}
        {(ritual.flavor || ritual.hint) && (
          <JimboRow wrap gap="md" align="stretch">
            {ritual.flavor && (
              <JimboInnerPanel className="j-daily-ritual__flavor-box">
                <JimboText size="xs" tone="grey" className="j-daily-ritual__flavor-label">
                  Flavor:
                </JimboText>
                <JimboText size="xs" tone="white">
                  {ritual.flavor}
                </JimboText>
              </JimboInnerPanel>
            )}

            {ritual.hint && (
              <JimboInnerPanel className="j-daily-ritual__hint-box">
                <JimboText size="xs" tone="green" className="j-daily-ritual__hint-label">
                  Strategy Hint:
                </JimboText>
                <JimboText size="xs" tone="white">
                  {ritual.hint}
                </JimboText>
              </JimboInnerPanel>
            )}
          </JimboRow>
        )}

        {/* ── Action Bar ─────────────────────────────────────────────────── */}
        <JimboRow wrap gap="sm" align="center" justify="between">
          <JimboRow gap="xs" align="center">
            {onPlayRitual && (
              <JimboButton
                size="sm"
                tone="green"
                onClick={() => onPlayRitual(ritual)}
              >
                <FiPlay /> Play Daily Ritual
              </JimboButton>
            )}

            {onLoadJaml && (
              <JimboButton
                size="sm"
                tone="blue"
                onClick={() => onLoadJaml(ritual.jaml)}
              >
                <FiCode /> Load into IDE
              </JimboButton>
            )}
          </JimboRow>

          <JimboButton
            size="xs"
            tone={copied ? "green" : "blue"}
            onClick={handleCopyJaml}
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? "Copied JAML!" : "Copy JAML"}
          </JimboButton>
        </JimboRow>
      </JimboStack>
    </JimboPanel>
  );
}
