"use client";
import React from "react";

export interface JimboCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  children?: React.ReactNode;
}

/**
 * Thin wrapper around `<canvas>`.
 *
 * Used by `CanvasRenderer` and any other component that needs a raw
 * drawing surface. The ESLint `no-raw-html` rule forbids `<canvas>`
 * outside `src/ui/`, so consumers use this primitive instead.
 */
export const JimboCanvas = React.forwardRef<HTMLCanvasElement, JimboCanvasProps>(
  function JimboCanvas({ children, ...rest }, ref) {
    return <canvas ref={ref} {...rest}>{children}</canvas>;
  }
);
