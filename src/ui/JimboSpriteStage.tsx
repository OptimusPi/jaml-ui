"use client";

import React, { type CSSProperties, type ReactNode } from "react";

export interface JimboSpriteStageProps {
  width: number;
  height: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Pixelated positioned stage for multi-layer CSS sprite-sheet compositions
 * (`DeckSprite`, `StandardCard`).
 */
export function JimboSpriteStage({
  width,
  height,
  title,
  className,
  style,
  children,
}: JimboSpriteStageProps) {
  return (
    <div
      className={["j-sprite-stage", className].filter(Boolean).join(" ")}
      title={title}
      style={{
        width,
        height,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface JimboSpriteLayerProps {
  imageUrl?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  width?: number;
  height?: number;
  scale?: number;
  zIndex?: number;
  filter?: string;
  opacity?: number;
  mixBlendMode?: CSSProperties["mixBlendMode"];
  background?: string;
  pointerEvents?: CSSProperties["pointerEvents"];
  inset?: boolean;
  className?: string;
}

export function JimboSpriteLayer({
  imageUrl,
  backgroundSize,
  backgroundPosition,
  width,
  height,
  scale,
  zIndex,
  filter,
  opacity,
  mixBlendMode,
  background,
  pointerEvents,
  inset = false,
  className,
}: JimboSpriteLayerProps) {
  const layerStyle: CSSProperties = {
    position: "absolute",
    ...(inset ? { inset: 0 } : { top: 0, left: 0 }),
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(scale !== undefined ? { transform: `scale(${scale})`, transformOrigin: "top left" } : {}),
    ...(zIndex !== undefined ? { zIndex } : {}),
    ...(imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundRepeat: "no-repeat" } : {}),
    ...(backgroundSize ? { backgroundSize } : {}),
    ...(backgroundPosition ? { backgroundPosition } : {}),
    ...(filter ? { filter } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(mixBlendMode ? { mixBlendMode } : {}),
    ...(background ? { background } : {}),
    ...(pointerEvents ? { pointerEvents } : {}),
    imageRendering: "pixelated",
  };

  return <div className={className} style={layerStyle} />;
}
