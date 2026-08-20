"use client";

import React from "react";
import { Renderer, type ReactSpec } from "@json-render/react";
import type { Spec } from "@json-render/core";
import { jimboRegistry } from "./registry.js";
import { jimboCatalog } from "./catalog.js";
import { JimboApp } from "../ui/JimboApp.js";

export interface JimboJsonRendererProps {
  /** The AI-generated JSON UI specification */
  spec: ReactSpec<typeof jimboCatalog> | Spec | null;
  /** Whether the spec is currently streaming / loading from an LLM */
  loading?: boolean;
  /** Optional container className */
  className?: string;
  /** Optional container style */
  style?: React.CSSProperties;
}

/**
 * Jimbo Generative UI Renderer (powered by Vercel Labs `@json-render`).
 *
 * Automatically mounts inside `<JimboApp>` so all generated components receive
 * the authentic pixel font, felt background, and zero-flex CSS Grid layout.
 */
export function JimboJsonRenderer({
  spec,
  loading = false,
  className = "",
  style,
}: JimboJsonRendererProps) {
  if (!spec) return null;

  return (
    <JimboApp className={className} style={style}>
      <Renderer spec={spec as never} registry={jimboRegistry} loading={loading} />
    </JimboApp>
  );
}
