/** Same values as src/styles/tokens.css, for use in JS. Keep the two in sync. */

export const palette = {
  red: 'oklch(67.46% 0.2107 27.29)', // #fe5148
  redDeep: 'oklch(46.75% 0.1583 27.95)', // #a02721
  blue: 'oklch(65.58% 0.1899 250.83)', // #0093ff
  blueDeep: 'oklch(45.61% 0.1390 252.61)', // #0057a1
  green: 'oklch(63.60% 0.1062 163.60)', // #429f79
  greenDeep: 'oklch(43.80% 0.0763 163.39)', // #215f46
  greenText: 'oklch(71.27% 0.1412 161.53)', // #35bd86
  orange: 'oklch(77.03% 0.1741 64.05)', // #ff9800
  orangeDeep: 'oklch(53.93% 0.1238 62.25)', // #a05b00
  purple: 'oklch(63.72% 0.1371 304.31)', // #9e74ce
  purpleDeep: 'oklch(43.91% 0.0982 303.74)', // #5e437e
  gold: 'oklch(79.75% 0.1389 86.43)', // #e4b643
  planet: 'oklch(67.36% 0.1225 219.87)', // #00a7ca
  spectral: 'oklch(59.99% 0.2140 261.50)', // #2e76fd
  grey: 'oklch(78.09% 0.0224 207.57)', // #a8bcbf
  tealGrey: 'oklch(40.67% 0.0157 208.75)', // #404c4e
  darkGrey: 'oklch(41.51% 0.0283 213.23)', // #3a5055
  darkest: 'oklch(27.80% 0.0181 207.89)', // #1e2b2d
  surfaceInset: 'oklch(33.65% 0.0226 218.99)', // #2a3a3f
  panelEdge: 'oklch(28.88% 0.0224 214.97)', // #1e2e32
  innerBorder: 'oklch(38.54% 0.0544 260.79)', // #334461
  borderSilver: 'oklch(81.20% 0.0246 262.08)', // #b9c2d2
  borderSouth: 'oklch(59.09% 0.0187 259.42)', // #777e89
  background: 'oklch(19.78% 0.0171 195.85)', // #0c1818
  white: 'oklch(100% 0 0)',
  black: 'oklch(0% 0 0)',
} as const;

export type PaletteName = keyof typeof palette;

/**
 * Tones are the colours a control can wear. `face` is the fill; `deep` is the
 * darker shade used for south edges on badges and tab rails.
 */
export const tones = {
  orange: { face: palette.orange, deep: palette.orangeDeep },
  red: { face: palette.red, deep: palette.redDeep },
  blue: { face: palette.blue, deep: palette.blueDeep },
  green: { face: palette.green, deep: palette.greenDeep },
  purple: { face: palette.purple, deep: palette.purpleDeep },
} as const;

export type Tone = keyof typeof tones;
export const toneNames = Object.keys(tones) as Tone[];

/** Surface roles. These swap per theme; tones never do. */
export const themes = {
  dark: {
    page: palette.background,
    surface: palette.darkGrey,
    surfaceInset: palette.surfaceInset,
    surfaceEdge: palette.panelEdge,
    border: palette.borderSilver,
    borderSouth: palette.borderSouth,
    text: palette.white,
    textMuted: palette.grey,
    textShadow: 'oklch(0% 0 0 / 0.8)',
    focus: palette.gold,
  },
  light: {
    page: 'oklch(93% 0.012 207)',
    surface: 'oklch(98% 0.006 207)',
    surfaceInset: 'oklch(90% 0.014 207)',
    surfaceEdge: 'oklch(80% 0.018 207)',
    border: palette.darkGrey,
    borderSouth: palette.darkest,
    text: palette.darkest,
    textMuted: palette.tealGrey,
    textShadow: 'oklch(100% 0 0 / 0)',
    focus: palette.blueDeep,
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeRole = keyof (typeof themes)['dark'];

export const space = { xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px' } as const;

export const radius = { sm: '4px', md: '6px', lg: '8px', pill: '10px' } as const;

export const font = {
  jimbo: "'m6x11plus', 'm6x11', monospace",
  code: "'JetBrains Mono', 'Roboto Mono', monospace",
} as const;

/** m6x11plus is drawn on an 18px grid; sizes stay on or near it. */
export const fontSize = { xs: '12px', sm: '14px', md: '18px', lg: '22px', xl: '27px', '2xl': '36px' } as const;

export const motion = {
  ease: '150ms ease-out',
  bounce: '900ms ease-in-out',
} as const;

export const depth = {
  /** How far a button face sits above its shadow, and how far it drops when pressed. */
  press: '4px',
  panelBorder: '3px',
  shadow: 'oklch(0% 0 0 / 0.3)',
  shadowHeavy: 'oklch(0% 0 0 / 0.55)',
} as const;

export const size = {
  /** Smallest comfortable touch target. md buttons meet it. */
  touch: '44px',
} as const;

export const tokens = { palette, tones, themes, space, radius, font, fontSize, motion, depth, size } as const;
export type Tokens = typeof tokens;
