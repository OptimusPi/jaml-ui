"use client";
import React from "react";

export interface JimboBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a different element (default: div) */
  as?: "div" | "section" | "article" | "aside" | "main" | "nav" | "header" | "footer";
  children?: React.ReactNode;
}

/**
 * Thin wrapper around `<div>` (or another block element).
 *
 * All consumer code outside `src/ui/` must use `JimboBox` instead of raw
 * `<div>` — the ESLint `no-raw-html` rule forbids intrinsic HTML elements.
 * This component exists so that layouts can still use a plain container
 * without reaching for a higher-level primitive that adds semantics they
 * don't need (e.g. `JimboPanel` implies a visible card).
 */
export const JimboBox = React.forwardRef<HTMLDivElement, JimboBoxProps>(
  function JimboBox({ as: Tag = "div", children, ...rest }, ref) {
    return <Tag ref={ref as React.Ref<HTMLDivElement>} {...rest}>{children}</Tag>;
  }
);
