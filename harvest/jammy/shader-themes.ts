/** Minimum time (ms) to keep the current background shader visible during scene transitions. */
export const SHADER_MIN_DISPLAY_MS = 3000;

export type ShaderThemeConfig = {
    SPIN_ROTATION: number;
    SPIN_SPEED: number;
    COLOUR_1: [number, number, number, number];
    COLOUR_2: [number, number, number, number];
    COLOUR_3: [number, number, number, number];
    CONTRAST: number;
    LIGHTING: number;
    SPIN_AMOUNT: number;
    PIXEL_FILTER: number;
    /** Lerp multiplier — lower = slower transition. Default 1.0 = 2s baseline. */
    LERP_RATE?: number;
};

// Colors in 0.0-1.0 range [r, g, b, a]
import { JimboColorOption } from "./jimbo-ui/types";

function hexToNormalized(hex: string): [number, number, number, number] {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return [Number(r.toFixed(3)), Number(g.toFixed(3)), Number(b.toFixed(3)), 1.0];
}

// Map theme colors to the Jimbo UI palette where possible
const C = {
    WHITE: hexToNormalized(JimboColorOption.WHITE),
    BORDER_SILVER: hexToNormalized(JimboColorOption.BORDER_SILVER),
    GREY: hexToNormalized(JimboColorOption.GREY),
    DARK_GREY: hexToNormalized(JimboColorOption.DARK_GREY),
    DARKEST: hexToNormalized(JimboColorOption.DARKEST),
    JIMBO_BLUE: hexToNormalized(JimboColorOption.BLUE),
    JIMBO_RED: hexToNormalized(JimboColorOption.RED),
    SOFT_GREEN: hexToNormalized(JimboColorOption.GREEN),
};

export const SHADER_MODES: Record<string, ShaderThemeConfig> = {
    // Boot / WASM-loading: same Balatro-forward swirl as welcome — users see art immediately, not a void.
    loading: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: C.JIMBO_RED,
        COLOUR_2: C.JIMBO_BLUE,
        COLOUR_3: C.DARKEST,
        CONTRAST: 3.6,
        LIGHTING: 0.42,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 630.0,
        LERP_RATE: 0.67,
    },
    // Pre-start / welcome: Balatro home colors.
    prestart: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: C.JIMBO_RED,
        COLOUR_2: C.JIMBO_BLUE,
        COLOUR_3: C.DARKEST,
        CONTRAST: 3.6,
        LIGHTING: 0.42,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 630.0,
        LERP_RATE: 0.67,
    },
    welcome: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: C.JIMBO_RED,
        COLOUR_2: C.JIMBO_BLUE,
        COLOUR_3: C.DARKEST,
        CONTRAST: 3.6,
        LIGHTING: 0.42,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 630.0,
        LERP_RATE: 0.67,
    },
    home: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: [0.8, 0.2, 0.3, 1.0],
        COLOUR_2: [0.5, 0.2, 0.6, 1.0],
        COLOUR_3: [0.1, 0.05, 0.15, 1.0],
        CONTRAST: 3.6,
        LIGHTING: 0.42,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 630.0,
        LERP_RATE: 0.8,
    },
    chatting: {
        SPIN_ROTATION: -1.25,
        SPIN_SPEED: 1.25,
        COLOUR_1: C.JIMBO_BLUE,
        COLOUR_2: C.GREY,
        COLOUR_3: C.DARKEST,
        CONTRAST: 2.2,
        LIGHTING: 0.5,
        SPIN_AMOUNT: 0.06,
        PIXEL_FILTER: 620.0,
        LERP_RATE: 0.8,
    },
    typing: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: C.SOFT_GREEN,
        COLOUR_2: C.JIMBO_BLUE,
        COLOUR_3: C.DARKEST,
        CONTRAST: 2.2,
        LIGHTING: 0.58,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 620.0,
        LERP_RATE: 0.8,
    },
    tool: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: [1.0, 0.6, 0.0, 1.0],
        COLOUR_2: [0.5, 0.5, 0.5, 1.0],
        COLOUR_3: [0.1, 0.1, 0.1, 1.0],
        CONTRAST: 1.8,
        LIGHTING: 0.5,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 800.0,
        LERP_RATE: 0.75,
    },
    searching: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: [1.0, 0.1, 0.1, 1.0],
        COLOUR_2: [0.6, 0.0, 0.0, 1.0],
        COLOUR_3: [0.0, 0.0, 0.0, 1.0],
        CONTRAST: 5.0,
        LIGHTING: 0.2,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 1000.0,
        LERP_RATE: 0.8,
    },
    // Try Harder / community helper search: calmer blue/silver/navy with moderate swirl
    tryharder: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: [0.0, 0.47, 0.84, 1.0],
        COLOUR_2: [0.71, 0.76, 0.8, 1.0],
        COLOUR_3: [0.04, 0.09, 0.16, 1.0],
        CONTRAST: 3.2,
        LIGHTING: 0.55,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 630.0,
        LERP_RATE: 0.8,
    },
    results: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: [0.9, 0.2, 0.2, 1.0],
        COLOUR_2: [0.0, 0.5, 0.9, 1.0],
        COLOUR_3: [0.1, 0.1, 0.2, 1.0],
        CONTRAST: 4.0,
        LIGHTING: 0.45,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 630.0,
        LERP_RATE: 0.8,
    },
    // Announcing mode kept for compatibility with any remaining callers.
    announcing: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: C.JIMBO_RED,
        COLOUR_2: C.JIMBO_BLUE,
        COLOUR_3: C.DARKEST,
        CONTRAST: 3.4,
        LIGHTING: 0.42,
        SPIN_AMOUNT: 0.18,
        PIXEL_FILTER: 600.0,
        LERP_RATE: 0.85,
    },
    /** app/error.tsx — same pixel swirl, “oops” red + gold accent */
    error: {
        SPIN_ROTATION: -3.14,
        SPIN_SPEED: 3.14,
        COLOUR_1: C.JIMBO_RED,
        COLOUR_2: hexToNormalized(JimboColorOption.GOLD),
        COLOUR_3: C.DARKEST,
        CONTRAST: 3.5,
        LIGHTING: 0.4,
        SPIN_AMOUNT: 0.19,
        PIXEL_FILTER: 635.0,
        LERP_RATE: 0.72,
    },
};

export type ShaderMode = keyof typeof SHADER_MODES;
