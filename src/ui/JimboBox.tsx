"use client";
import React from "react";

export interface JimboBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a different element (default: div) */
  as?: "div" | "section" | "article" | "aside" | "main" | "nav" | "header" | "footer";
  children?: React.ReactNode;
}

/**
 * Thin wrapper around `<div>` (or another block element) for plain layout
 * containers. Use it instead of `JimboPanel` when no visible card is wanted.
 */
export const JimboBox = React.forwardRef<HTMLDivElement, JimboBoxProps>(
  function JimboBox({ as: Tag = "div", children, ...rest }, ref) {
    return <Tag ref={ref as React.Ref<HTMLDivElement>} {...rest}>{children}</Tag>;
  }
);
