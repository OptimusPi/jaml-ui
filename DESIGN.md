---
name: Jimbo UI
description: Balatro Jimbo kit for JAML seed tooling in MCP iframes
colors:
  red: "#fe5148"
  blue: "#0093ff"
  green: "#429f79"
  orange: "#ff9800"
  gold: "#e4b643"
  purple: "#9e74ce"
  planet: "#00a7ca"
  spectral: "#2e76fd"
  dark-red: "#a02721"
  dark-blue: "#0057a1"
  dark-orange: "#a05b00"
  dark-green: "#215f46"
  dark-grey: "#3a5055"
  darkest: "#1e2b2d"
  grey: "#a8bcbf"
  teal-grey: "#404c4e"
  surface-inset: "#2a3a3f"
  panel-edge: "#1e2e32"
  inner-border: "#334461"
  border-silver: "#b9c2d2"
  border-south: "#777e89"
  green-text: "#35bd86"
  white: "#ffffff"
  black: "#000000"
typography:
  body:
    fontFamily: "m6x11plus, m6x11, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.2
spacing:
  xs: "2px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "10px"
---

# Jimbo UI

Balatro's table in an MCP iframe: pixel type, chunky south lip, sprites. Playful, not cute. Seed-finder hardware.

**Tokens live in `src/ui/jimbo-tokens.css`.** `tokens.ts` is the JS hex mirror for canvas / CodeMirror. A token is a named decision (re-themed or reused). Component variants (`.j-btn--orange`) consume tokens; they are not tokens.

## Palette

Eyedropped from the game's shader, not Lua `G.C`.

- **Game:** `--j-red` `--j-blue` `--j-green` `--j-orange` `--j-gold` `--j-purple` `--j-planet` `--j-spectral`
- **Pressed lip:** `--j-dark-red` `--j-dark-blue` `--j-dark-green` `--j-dark-orange`
- **Surfaces:** `--j-darkest` `--j-dark-grey` / `--j-surface` `--j-surface-inset`
- **Chrome:** `--j-border-silver` `--j-border-south` `--j-panel-edge` `--j-white` `--j-grey`
- **Score green:** `--j-green-text` (brighter than `--j-green`)

`--j-gold-text` and `--j-orange-text` alias gold / orange. `--j-surface` aliases `--j-dark-grey`.

## Type

`--j-font` (m6x11plus), `--j-font-m6x11` (16px grid), `--j-font-code` (IDE). Sizes live on `.j-text--*` in `jimbo.css`, snapped to the pixel font grids. Weight stays 400.

## Space / radius / press

`--j-space-xs…xl`, `--j-radius-sm…pill` (max 10px). Buttons: `--j-press-y` 2px, solid south shadow, snap press. Iframe lock: `--j-app-w/h` 375.

## What this is not

Not a second palette in this file. Not pico–hero type scales. Not 999px pills. Not a flex ban as identity.
