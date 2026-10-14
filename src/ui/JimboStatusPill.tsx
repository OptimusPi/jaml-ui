"use client";

import type { HTMLAttributes } from "react";

export type JimboStatus = "idle" | "running" | "ok" | "error" | "paused";

export interface JimboStatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status?: JimboStatus;
  label?: string;
}

// Spelled out, not interpolated — see the note in JimboBadge.tsx.
const STATUS_CLASS = {
  idle: "j-status-pill--idle",
  running: "j-status-pill--running",
  ok: "j-status-pill--ok",
  error: "j-status-pill--error",
  paused: "j-status-pill--paused",
} as const satisfies Record<JimboStatus, string>;

/** Short single-word state indicator — the missing React half of `.j-status-pill`. */
export function JimboStatusPill({ status = "idle", label, className, children, ...rest }: JimboStatusPillProps) {
  const classes = ["j-status-pill", STATUS_CLASS[status], className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      <span className="j-status-pill__dot" aria-hidden />
      {label ?? children ?? status}
    </span>
  );
}
