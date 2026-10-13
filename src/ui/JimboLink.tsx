"use client";
import React from "react";

export interface JimboLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

/** Thin wrapper around `<a>`. Use this instead of a raw `<a>` outside `src/ui/`. */
export function JimboLink({ children, ...rest }: JimboLinkProps) {
  return <a {...rest}>{children}</a>;
}
