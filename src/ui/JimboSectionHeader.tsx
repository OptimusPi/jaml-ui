"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type JimboSectionTone = "red" | "orange" | "blue" | "green" | "purple" | "gold" | "grey";

export interface JimboSectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  tone?: JimboSectionTone;
}

// Spelled out, not interpolated — see the note in JimboLayout.tsx.
const TAG_CLASS = {
  red: "j-section-header__tag--red",
  orange: "j-section-header__tag--orange",
  blue: "j-section-header__tag--blue",
  green: "j-section-header__tag--green",
  purple: "j-section-header__tag--purple",
  gold: "j-section-header__tag--gold",
  grey: "j-section-header__tag--grey",
} as const satisfies Record<JimboSectionTone, string>;

const RULE_CLASS = {
  red: "j-section-header__rule--red",
  orange: "j-section-header__rule--orange",
  blue: "j-section-header__rule--blue",
  green: "j-section-header__rule--green",
  purple: "j-section-header__rule--purple",
  gold: "j-section-header__rule--gold",
  grey: "j-section-header__rule--grey",
} as const satisfies Record<JimboSectionTone, string>;

/** Colored tag + rule — section divider inside a panel. */
export function JimboSectionHeader({
  label,
  tone = "blue",
  className,
  ...rest
}: JimboSectionHeaderProps) {
  const classes = ["j-section-header", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <span className={`j-section-header__tag ${TAG_CLASS[tone]}`}>{label}</span>
      <span className={`j-section-header__rule ${RULE_CLASS[tone]}`} aria-hidden />
    </div>
  );
}
