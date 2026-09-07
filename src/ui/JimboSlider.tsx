"use client";
import React from "react";

export interface JimboSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  /** Fires with the parsed numeric value on every input. */
  onValueChange?: (value: number) => void;
}

/**
 * Chunky Balatro range dial — the missing React half of `.j-slider`.
 * The filled track is driven by the `--j-slider-fill` custom property so the
 * gold portion always matches the thumb position.
 */
export const JimboSlider = React.forwardRef<HTMLInputElement, JimboSliderProps>(
  function JimboSlider({ onValueChange, className, value, min = 0, max = 100, style, ...rest }, ref) {
    const v = Number(value ?? 0);
    const lo = Number(min);
    const hi = Number(max);
    const fill = hi > lo ? Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100)) : 0;
    const classes = ["j-slider", className].filter(Boolean).join(" ");
    return (
      <input
        ref={ref}
        type="range"
        className={classes}
        value={value}
        min={min}
        max={max}
        style={{ ...(style ?? {}), ["--j-slider-fill" as string]: `${fill}%` }}
        onChange={(e) => onValueChange?.(Number(e.currentTarget.value))}
        {...rest}
      />
    );
  }
);
