"use client";
import React from "react";

export interface JimboInlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/** Thin wrapper around `<span>`. For styled text, use `JimboText` instead. */
export function JimboInline({ children, ...rest }: JimboInlineProps) {
  return <span {...rest}>{children}</span>;
}
