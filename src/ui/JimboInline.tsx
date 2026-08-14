"use client";
import React from "react";

export interface JimboInlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/**
 * Thin wrapper around `<span>`.
 *
 * Use when you need an inline container that is not a `JimboText` (which
 * applies typography tokens). For styled text, prefer `JimboText`.
 */
export function JimboInline({ children, ...rest }: JimboInlineProps) {
  return <span {...rest}>{children}</span>;
}
