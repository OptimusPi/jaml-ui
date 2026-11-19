"use client";

import React, { type HTMLAttributes, type RefObject } from "react";

export interface JimboCanvasSurfaceProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  aspectRatio: number;
  hoverTilt?: boolean;
  className?: string;
  hitProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * Canvas mount surface for sprite card rendering (`JamlCardRenderer`).
 * Owns the raw `<canvas>` and pointer hit target inside `src/ui/`.
 */
export function JimboCanvasSurface({
  containerRef,
  canvasRef,
  aspectRatio,
  hoverTilt = false,
  className = "",
  hitProps,
}: JimboCanvasSurfaceProps) {
  return (
    <div
      ref={containerRef}
      className={["j-card-renderer", className].filter(Boolean).join(" ")}
      data-hover-tilt={hoverTilt}
      data-hovered="false"
      style={{ "--j-card-aspect": String(aspectRatio) } as React.CSSProperties}
    >
      <canvas ref={canvasRef} className="j-card-renderer__canvas" />
      <div className="j-card-renderer__hit" {...hitProps} />
    </div>
  );
}
