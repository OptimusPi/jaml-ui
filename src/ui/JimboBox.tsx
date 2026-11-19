"use client";

import React, { forwardRef, type HTMLAttributes } from "react";

export type JimboBoxProps = HTMLAttributes<HTMLDivElement>;

/**
 * Minimal Jimbo structural container primitive.
 * Use when composing semantic `.j-*` layout shells outside `src/ui/`
 * so consumer screens never emit raw `<div>` elements.
 */
export const JimboBox = forwardRef<HTMLDivElement, JimboBoxProps>(function JimboBox(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
});
