"use client";
import React from "react";

export interface JimboLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

/**
 * Thin wrapper around `<a>`.
 *
 * Use when you need a plain hyperlink. The ESLint `no-raw-html` rule
 * forbids `<a>` outside `src/ui/`, so consumers use this primitive.
 */
export function JimboLink({ children, ...rest }: JimboLinkProps) {
  return <a {...rest}>{children}</a>;
}
