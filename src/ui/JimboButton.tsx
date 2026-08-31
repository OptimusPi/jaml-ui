"use client";

import type { ButtonHTMLAttributes } from "react";

export interface JimboButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "orange" | "red" | "blue" | "green" | "purple";
  fullWidth?: boolean;
  label?: string;
}

// Spelled out, not interpolated — see the note in JimboLayout.tsx.
const SIZE_CLASS = {
  xs: "j-btn--xs",
  sm: "j-btn--sm",
  md: "j-btn--md",
  lg: "j-btn--lg",
} as const satisfies Record<NonNullable<JimboButtonProps["size"]>, string>;

const TONE_CLASS = {
  orange: "j-btn--orange",
  red: "j-btn--red",
  blue: "j-btn--blue",
  green: "j-btn--green",
  purple: "j-btn--purple",
} as const satisfies Record<NonNullable<JimboButtonProps["tone"]>, string>;

export function JimboButton({
  size = "md",
  tone = "orange",
  fullWidth = false,
  label,
  className,
  children,
  disabled,
  ...rest
}: JimboButtonProps) {
  const classes = [
    "j-btn",
    SIZE_CLASS[size],
    TONE_CLASS[tone],
    fullWidth ? "j-btn--full" : "",
    disabled ? "j-btn--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} disabled={disabled} {...rest}>
      <span className="j-btn__face">{label ?? children}</span>
    </button>
  );
}
