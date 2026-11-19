"use client";

import React from "react";
import { Layer } from "./Layer.js";
import { useJamlCardRenderer } from "./useJamlCardRenderer.js";
import { JimboCanvasSurface } from "../ui/JimboCanvasSurface.js";

export interface JamlCardRendererProps {
  layers: Layer[];
  invert?: boolean;
  className?: string;
  hoverTilt?: boolean;
}

export function JamlCardRenderer({
  layers,
  invert = false,
  className = "",
  hoverTilt = false,
}: JamlCardRendererProps) {
  const { canvasRef, containerRef, ratio, handlers } = useJamlCardRenderer({
    layers,
    invert,
    hoverTilt,
  });

  return (
    <JimboCanvasSurface
      containerRef={containerRef}
      canvasRef={canvasRef}
      aspectRatio={ratio}
      hoverTilt={hoverTilt}
      className={className}
      hitProps={handlers}
    />
  );
}
