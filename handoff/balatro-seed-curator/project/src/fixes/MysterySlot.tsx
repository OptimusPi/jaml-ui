"use client";
import React, { useState } from "react";
import { JimboSprite } from "../../ui/sprites.js";
import { JimboColorOption, withAlpha, JIMBO_ANIMATIONS } from "../../ui/tokens.js";
import type { SpriteSheetType } from "../../sprites/spriteMapper.js";

export type JamlZone = "must" | "should" | "mustnot";

export type SlotCategory =
  | "joker" | "voucher" | "tag" | "boss"
  | "tarot" | "spectral" | "planet" | "pack";

export interface SlotSelection {
  category: SlotCategory;
  value: string;
  clauseKey: string;
  packName?: string;
  boosterPacks?: number[];
  rarity?: "common" | "uncommon" | "rare" | "legendary";
}

export interface MysterySlotProps {
  zone: JamlZone;
  sheetType: SpriteSheetType;
  selection?: SlotSelection;
  width?: number;
  onTap?: () => void;
  onClear?: () => void;
  style?: React.CSSProperties;
}

const C = JimboColorOption;

const ZONE_GLOW: Record<JamlZone, string> = {
  must: C.BLUE,
  should: C.RED,
  mustnot: C.ORANGE,
};

export function MysterySlot({
  zone,
  sheetType,
  selection,
  width = 56,
  onTap,
  onClear,
  style,
}: MysterySlotProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const cardRef = React.useRef<HTMLDivElement>(null);

  const glowColor = ZONE_GLOW[zone];
  const isEmpty = !selection;
  const cardH = Math.round((width * 95) / 71);

  const spriteName = selection?.packName ?? selection?.value ?? "";
  const spriteSheet = selection?.packName
    ? "Boosters"
    : selection
      ? categoryToSheet(selection.category) ?? sheetType
      : sheetType;

  const scale = pressed ? 0.95 : hover ? JIMBO_ANIMATIONS.JUICE_UP_SCALE : 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
    setTilt({ rx: ny * -8, ry: nx * 8, tx: nx * -2, ty: ny * -2 });
  };

  const handleMouseLeave = () => {
    setHover(false);
    setPressed(false);
    setTilt({ rx: 0, ry: 0, tx: 0, ty: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onTap}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: "relative",
        width: width + 8,
        height: cardH + 8,
        cursor: onTap ? "pointer" : "default",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          // NO dashed border — mystery sprite is the empty state, hover gets a glow via box-shadow only
          background: "transparent",
          transform: `perspective(600px) scale(${scale}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate(${tilt.tx}px, ${tilt.ty}px)`,
          transformStyle: "preserve-3d",
          transition: hover
            ? `box-shadow 120ms ease`
            : `transform 400ms ${JIMBO_ANIMATIONS.JUICE_EASING}, box-shadow 200ms ease`,
          // hover: zone-color glow ring via box-shadow, no border
          boxShadow: hover
            ? `0 0 0 2px ${withAlpha(glowColor, 0.85)}, 0 0 14px ${withAlpha(glowColor, 0.4)}, 0 8px 16px ${withAlpha(C.BLACK, 0.4)}`
            : `0 2px 4px ${withAlpha(C.BLACK, 0.2)}`,
          zIndex: hover ? 10 : 1,
          pointerEvents: "none",
        }}
      >
        {/* Mystery sprite or selected sprite — no filter/desaturation, the sprite IS the visual */}
        <JimboSprite
          name={spriteName}
          sheet={spriteSheet}
          width={width}
        />

        {selection && onClear && (
          <div
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: C.RED,
              color: C.WHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontFamily: "m6x11plus, ui-monospace, monospace",
              cursor: "pointer",
              lineHeight: 1,
              boxShadow: `0 1px 4px ${withAlpha(C.BLACK, 0.5)}`,
              transform: "translateZ(10px)",
            }}
          >
            ×
          </div>
        )}

        {isEmpty && hover && (
          <div
            style={{
              position: "absolute",
              bottom: -16,
              left: "50%",
              transform: "translateX(-50%) translateZ(10px)",
              fontFamily: "m6x11plus, ui-monospace, monospace",
              fontSize: 10,
              color: glowColor,
              whiteSpace: "nowrap",
              textTransform: "lowercase",
              letterSpacing: 1,
            }}
          >
            + tap
          </div>
        )}
      </div>
    </div>
  );
}

function categoryToSheet(cat: SlotCategory): SpriteSheetType | null {
  switch (cat) {
    case "joker": return "Jokers";
    case "voucher": return "Vouchers";
    case "tag": return "tags";
    case "boss": return "BlindChips";
    case "tarot":
    case "spectral":
    case "planet": return "Tarots";
    case "pack": return "Boosters";
    default: return null;
  }
}
