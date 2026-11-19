"use client";

import React from "react";
import { JimboFooterBar } from "../ui/JimboFooterBar.js";

export interface JimboBalatroFooterProps {
  /** Fade the footer out */
  hidden?: boolean;
  /** Extra className */
  className?: string;
  /** Inline style override — e.g. `{ position: 'static' }` to opt out of the
   * default fixed-to-viewport placement when embedding outside the 320×568
   * MCP App frame. */
  style?: React.CSSProperties;
  /** Optional inline children */
  children?: React.ReactNode;
}

/**
 * Fan-site attribution footer with Balatro link. The "Balatro" in the name is
 * load-bearing — this footer is the public disclosure that the project is a
 * non-profit, rule-following, PlayStack-aware fan site. Always rendered;
 * required attribution for using Balatro art.
 */
export function JimboBalatroFooter({
  hidden = false,
  className = "",
  style,
  children,
}: JimboBalatroFooterProps) {
  if (hidden) {
    return null;
  }

  return (
    <JimboFooterBar className={className} style={style}>
      {children}
    </JimboFooterBar>
  );
}
