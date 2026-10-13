"use client";
import React from "react";

export interface JimboCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  children?: React.ReactNode;
}

/**
 * Thin wrapper around `<canvas>` for components that need a raw drawing surface.
 * Use this instead of a raw `<canvas>` outside `src/ui/`.
 */
export const JimboCanvas = React.forwardRef<HTMLCanvasElement, JimboCanvasProps>(
  function JimboCanvas({ children, ...rest }, ref) {
    return <canvas ref={ref} {...rest}>{children}</canvas>;
  }
);
