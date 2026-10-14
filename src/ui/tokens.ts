/**
 * JS mirror of jimbo-tokens.css :root hex.
 * CSS vars win on DOM. Use these for Canvas, SVG, CodeMirror.
 * Post-shader eyedrops — not Lua G.C.
 */

export const JimboColorOption = {
  RED: "#fe5148",
  BLUE: "#0093ff",
  GREEN: "#429f79",
  ORANGE: "#ff9800",
  GOLD: "#e4b643",
  PURPLE: "#9e74ce",
  PLANET: "#00a7ca",
  SPECTRAL: "#2e76fd",

  DARK_RED: "#a02721",
  DARK_BLUE: "#0057a1",
  DARK_ORANGE: "#a05b00",
  DARK_GREEN: "#215f46",

  DARK_GREY: "#3a5055",
  DARKEST: "#1e2b2d",
  GREY: "#a8bcbf",
  TEAL_GREY: "#404c4e",
  SURFACE: "#3a5055",
  SURFACE_INSET: "#2a3a3f",

  PANEL_EDGE: "#1e2e32",
  INNER_BORDER: "#334461",
  BORDER_SILVER: "#b9c2d2",
  BORDER_SOUTH: "#777e89",

  GREEN_TEXT: "#35bd86",
  WHITE: "#ffffff",
  BLACK: "#000000",

  /** Same decision as GOLD — kept so CodeMirror / old callers don't grow a second gold. */
  GOLD_TEXT: "#e4b643",
} as const;

export type JimboPaletteColor = keyof typeof JimboColorOption;

export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Juice / sway used by JS motion. Press lip lives in CSS (--j-press-y). */
export const JIMBO_ANIMATIONS = {
  JUICE_UP_SCALE: 1.05,
  JUICE_EASING: "cubic-bezier(0.16, 1, 0.3, 1)",
  SWAY_AMOUNT: 1.5,
  SWAY_DURATION: 4000,
} as const;
