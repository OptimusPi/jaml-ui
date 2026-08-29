// Jimbo palette — excavated from JAMMY (`lib/jimbo-ui/types.ts`).
//
// !! IMPORTANT !!
// These colors are EYEDROPPED FROM THE ACTUAL GAME PIXELS.
// The Lua source uses HEX() values that get transformed by the game's shader
// pipeline, CRT filter, and gamma correction. DO NOT replace these with the Lua
// HEX values — they will look wrong.
//
// Only the subset the orbital menu actually consumes is kept here. The full
// table (panel edges, tarot/planet/spectral button colors, sprite metadata) is
// still in the original repo if you need it.

export const JimboColorOption = {
    // Primary colors
    RED: "#ff4c40",
    BLUE: "#0093ff",
    GREEN: "#429f79",
    ORANGE: "#ff9800",
    GOLD: "#e4b643",
    PURPLE: "#9e74ce",

    // Dark variants for hover/pressed
    DARK_RED: "#a02721",
    DARK_BLUE: "#0057a1",
    DARK_ORANGE: "#a05b00",
    DARK_GREEN: "#215f46",
    DARK_PURPLE: "#5e437e",

    // Panel colors
    DARK_GREY: "#3a5055",
    DARKEST: "#1e2b2d",
    GREY: "#708386",

    // Borders & shadows
    BORDER_SILVER: "#b9c2d2",

    // Text colors
    GREEN_TEXT: "#35bd86",
    WHITE: "#ffffff",
    BLACK: "#000000",
} as const;

export type JimboPaletteColor = keyof typeof JimboColorOption;

/** Hex + alpha (0–1) → `rgba()`. e.g. withAlpha('#ff4c40', 0.5) → 'rgba(255, 76, 64, 0.5)' */
export function withAlpha(hex: string, alpha: number): string {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Timing constants the orbit depends on. Must stay in sync with `styles.css`. */
export const JIMBO_ANIMATIONS = {
    /** Button press — shadow disappears, button moves down. */
    PRESS_TRANSLATE_Y: 2, // px
    PRESS_DURATION: 50, // ms

    /** Submenu push/pop: pills sink to center, swap, rise again. */
    MENU_SINK_DURATION: 200, // ms
    MENU_RISE_DURATION: 300, // ms
    /** Full close — must match the `.orbital-pill` transition in styles.css. */
    MENU_ORBIT_DURATION: 320, // ms
} as const;
