"use client";

import React from "react";
import { resolveJamlAssetUrl } from "../assets.js";
import { RANK_MAP, SUIT_MAP, ENHANCER_MAP, SEAL_MAP, EDITION_MAP, type SpritePos } from "../sprites/spriteData.js";
import { CardEdition, type CardSuit, type CardRank, type CardEnhancement, type CardSeal } from "./cardEnums.js";
import { JimboSpriteStage, JimboSpriteLayer } from "../ui/JimboSpriteStage.js";

// ── Sprite geometry ────────────────────────────────────────────────────────

const CARD_WIDTH = 71;
const CARD_HEIGHT = 95;

interface StandardCardProps {
  suit?: CardSuit;
  rank?: CardRank;
  name?: string;
  enhancement?: CardEnhancement;
  seal?: CardSeal;
  edition?: CardEdition;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

function parseStandardcardName(name: string): { rank: CardRank; suit: CardSuit } | null {
  const match = /^(.*?)(?:\s+of\s+|\s+)(.*?)$/i.exec(name.trim());
  if (!match) return null;
  const rawRank = match[1].trim();
  const rawSuit = match[2].trim();
  const rank = (rawRank === "A" ? "Ace" : rawRank === "K" ? "King" : rawRank === "Q" ? "Queen" : rawRank === "J" ? "Jack" : rawRank) as CardRank;
  const suit = (rawSuit.charAt(0).toUpperCase() + rawSuit.slice(1).toLowerCase()) as CardSuit;
  return RANK_MAP[rank] !== undefined && SUIT_MAP[suit] !== undefined ? { rank, suit } : null;
}

export function StandardCard({
  suit,
  rank,
  name,
  enhancement,
  seal,
  edition,
  className,
  size = 71,
  style,
}: StandardCardProps) {
  const parsed = !rank || !suit ? (name ? parseStandardcardName(name) : null) : null;
  const finalRank = rank ?? parsed?.rank;
  const finalSuit = suit ?? parsed?.suit;
  const col = finalRank ? RANK_MAP[finalRank] : undefined;
  const row = finalSuit ? SUIT_MAP[finalSuit] : undefined;

  if (col === undefined || row === undefined) {
    console.warn(`Invalid card: ${finalRank} of ${finalSuit}`);
    return null;
  }

  const scale = size / CARD_WIDTH;
  const finalH = size * (CARD_HEIGHT / CARD_WIDTH);

  const bgX = -col * CARD_WIDTH;
  const bgY = -row * CARD_HEIGHT;

  // Cell (1,0) of the enhancer sheet is the plain blank card body — used as
  // the base layer behind every card so transparent regions of the deck face
  // sprite don't reveal whatever is behind. Cell (0,0) is a red-card sprite,
  // NOT a blank base — do not fall back to it.
  const PLAIN_BASE: SpritePos = { x: 1, y: 0 };
  const enhPos: SpritePos = enhancement ? ENHANCER_MAP[enhancement] ?? PLAIN_BASE : PLAIN_BASE;
  const sealPos = seal ? SEAL_MAP[seal] ?? null : null;
  const editionCol = edition ? EDITION_MAP[edition] : undefined;

  const isNegative = edition === CardEdition.Negative;
  const baseFilter = isNegative ? "invert(0.94)" : "none";

  const enhancersUrl = resolveJamlAssetUrl("enhancers");
  const deckUrl = resolveJamlAssetUrl("deck");
  const editionsUrl = resolveJamlAssetUrl("editions");

  return (
    <JimboSpriteStage
      width={size}
      height={finalH}
      className={className}
      style={style}
      title={`${rank} of ${suit}${enhancement ? ` (${enhancement})` : ""}${seal ? ` [${seal} seal]` : ""}${edition ? ` {${edition}}` : ""}`}
    >
      <JimboSpriteLayer
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        scale={scale}
        zIndex={0}
        imageUrl={enhancersUrl}
        backgroundPosition={`${-enhPos.x * CARD_WIDTH}px ${-enhPos.y * CARD_HEIGHT}px`}
      />

      <JimboSpriteLayer
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        scale={scale}
        zIndex={1}
        imageUrl={deckUrl}
        backgroundPosition={`${bgX}px ${bgY}px`}
        filter={baseFilter}
      />

      {edition && edition !== CardEdition.Negative && editionCol !== undefined ? (
        <JimboSpriteLayer
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          scale={scale}
          zIndex={2}
          mixBlendMode="screen"
          opacity={0.6}
          imageUrl={editionsUrl}
          backgroundPosition={`${-editionCol * CARD_WIDTH}px 0px`}
        />
      ) : null}

      {sealPos ? (
        <JimboSpriteLayer
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          scale={scale}
          zIndex={3}
          imageUrl={enhancersUrl}
          backgroundPosition={`${-sealPos.x * CARD_WIDTH}px ${-sealPos.y * CARD_HEIGHT}px`}
        />
      ) : null}

      {isNegative ? (
        <JimboSpriteLayer
          inset
          zIndex={4}
          background="rgba(239, 68, 68, 0.1)"
          mixBlendMode="overlay"
          pointerEvents="none"
        />
      ) : null}
    </JimboSpriteStage>
  );
}
