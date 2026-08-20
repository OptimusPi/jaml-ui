"use client";

import type { HTMLAttributes } from "react";

export type JimboTextSize = "micro" | "xs" | "sm" | "md" | "lg" | "xl" | "display";
export type JimboTextTone = "white" | "grey" | "gold" | "red" | "blue" | "green" | "orange" | "purple";

export interface JimboTextProps extends HTMLAttributes<HTMLSpanElement> {
  size?: JimboTextSize;
  tone?: JimboTextTone;
}

// Spelled out, not interpolated — see the note in JimboBadge.tsx.
const SIZE_CLASS = {
  micro: "j-text--micro",
  xs: "j-text--xs",
  sm: "j-text--sm",
  md: "j-text--md",
  lg: "j-text--lg",
  xl: "j-text--xl",
  display: "j-text--display",
} as const satisfies Record<JimboTextSize, string>;

const TONE_CLASS = {
  white: "j-text--white",
  grey: "j-text--grey",
  gold: "j-text--gold",
  red: "j-text--red",
  blue: "j-text--blue",
  green: "j-text--green",
  orange: "j-text--orange",
  purple: "j-text--purple",
} as const satisfies Record<JimboTextTone, string>;

export function JimboText({ size = "md", tone = "white", className, children, ...rest }: JimboTextProps) {
  const classes = ["j-text", SIZE_CLASS[size], TONE_CLASS[tone], className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
