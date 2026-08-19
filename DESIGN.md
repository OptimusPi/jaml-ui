---
name: Jimbo UI
description: Tactile retro-arcade design system for JAML Balatro seed tooling in MCP iframes
colors:
  primary: "#fe5148"
  primary-dark: "#a02721"
  red: "#fe5148"
  dark-red: "#a02721"
  blue: "#0093ff"
  dark-blue: "#0057a1"
  orange: "#ff9800"
  dark-orange: "#a05b00"
  green: "#429f79"
  dark-green: "#215f46"
  gold: "#e4b643"
  purple: "#9e74ce"
  darkest: "#1e2b2d"
  dark: "#1c252a"
  dark-grey: "#3a5055"
  grey: "#a8bcbf"
  light-grey: "#b4c0c5"
  white: "#ffffff"
  black: "#000000"
  tarot: "#9e74ce"
  planet: "#00a7ca"
  spectral: "#2e76fd"
  panel-edge: "#1e2e32"
  inner-border: "#334461"
  border-silver: "#b9c2d2"
  border-south: "#777e89"
typography:
  display:
    fontFamily: "m6x11plus, monospace"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.08em"
  headline:
    fontFamily: "m6x11plus, monospace"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.05em"
  body:
    fontFamily: "m6x11plus, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  label:
    fontFamily: "m6x11plus, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.04em"
  scale:
    pico: "7px"
    micro: "8px"
    mini: "9px"
    caption-sm: "10px"
    caption: "11px"
    label: "12px"
    sub: "13px"
    body: "14px"
    title-sm: "16px"
    title: "18px"
    headline: "20px"
    hero-sm: "24px"
    display: "28px"
rounded:
  xs: "1px"
  sm: "3px"
  sm-md: "4px"
  md: "6px"
  base: "8px"
  lg: "10px"
  pill: "999px"
spacing:
  xs: "2px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: Jimbo UI

## Overview

**Creative North Star: "The Arcade Tactile Terminal"**

Jimbo UI brings the vibrant, chunky, tactile feel of Balatro directly into developer tools and MCP host environments. It is uncompromisingly mechanical: flat color fills, crisp pixel typography, solid south-edge drop shadows, and CRT scanlines create an authentic retro-arcade presence.

There are no blurry ambient glows, no generic gradient text, and no rounded SaaS cards masquerading as modern design. The interface prioritizes rock-solid deterministic layout (pure CSS Grid and absolute coordinates) so that every modal, card rail, and seed editor renders with exact precision inside host iframes.

**Key Characteristics:**
- **Deterministic Grid Composition:** Zero flex layout ensures identical rendering across varied host container widths.
- **Physical 3D Lips:** Depth is conveyed through solid south-edge box shadows (`box-shadow: 0 4px 0 ...`), not soft atmospheric blurs.
- **Authentic Pixel Typography:** Powered by `m6x11plus` with standard weights (no artificial bolding or ALL CAPS shouting).
- **High-Contrast Arcade Palette:** Distinctive saturated game tokens set against deep dark slate backgrounds.

## Colors

The palette is derived directly from Balatro's iconic card game visuals, featuring vibrant arcade accents anchored by deep chalkboard neutrals.

### Primary
- **Jimbo Red** (`#c8352b` / `var(--j-red)`): Primary action color, scoring cues, and core brand identity.
- **Jimbo Dark Red** (`#96231c` / `var(--j-dark-red)`): South-edge shadow and pressed state for primary elements.

### Secondary
- **Jimbo Blue** (`#2b7fc8` / `var(--j-blue)`): Chips, active navigation, informational badges, and secondary actions.
- **Jimbo Dark Blue** (`#1e5b8f` / `var(--j-dark-blue)`): South-edge shadow for blue buttons and callouts.
- **Jimbo Orange** (`#d97424` / `var(--j-orange)`): Select controls, filter bars, and warning indicators.
- **Jimbo Green** (`#489f38` / `var(--j-green)`): Success states, money counters, and confirmation badges.
- **Jimbo Gold** (`#e2a93b` / `var(--j-gold)`): Rare joker indicators, high-tier rewards, and highlights.

### Neutral
- **Jimbo Darkest** (`#12191d` / `var(--j-darkest)`): Base viewport background and inset input surfaces.
- **Jimbo Dark** (`#1c252a` / `var(--j-dark)`): Card panel and container background.
- **Jimbo Grey** (`#71828a` / `var(--j-grey)`): Secondary labels and deactivated metadata.
- **Jimbo White** (`#f7f9f9` / `var(--j-white)`): Primary text and icon foreground.

### Named Rules
**The South-Edge Rule.** Every interactive button and active badge carries a solid south lip in its corresponding dark token (`0 4px 0 <dark-token>`). Flat surfaces stay flat at rest; interactive elements convey physical elevation through solid pixel extrusion.

## Typography

**Display Font:** `m6x11plus`, monospace pixel face  
**Body Font:** `m6x11plus`, monospace pixel face  
**Character:** Crisp, readable pixel-art arcade font designed for tight scanability on retro gaming displays.

### Hierarchy
- **Display** (400 weight, 28px, 1.1 line-height): Modal titles and hero ante numbers.
- **Headline** (400 weight, 20px, 1.2 line-height): Section headers and filter inputs.
- **Body** (400 weight, 14px, 1.3 line-height): Standard card descriptions, table values, and editor text.
- **Label** (400 weight, 12px, 1.2 line-height): Badge tags, spinner captions, and keyboard shortcut hints.

### Named Rules
**The No-Shouting Rule.** Jimbo UI communicates hierarchy through font size and token color, never through `fontWeight: bold`, `700+`, or ALL CAPS text.

## Layout

Layouts are strictly deterministic. Because this UI runs inside MCP iframes whose dimensions are controlled by the host, fluid reflow bugs are avoided by design:
- **Pure CSS Grid:** Use `display: grid` with explicit tracks (`grid-template-columns`, `grid-auto-flow: column/row`).
- **Zero Flex:** `display: flex` and all `flex-*` rules are forbidden across the codebase.
- **Explicit Alignment:** Use `place-items: center`, `justify-content: start | center | end | space-between`, and `align-items: start | center | end`.

## Elevation & Depth

Surfaces are crisp and flat, layered cleanly through background tone steps and solid pixel drop shadows.
- **Button Lip:** `box-shadow: 0 4px 0 var(--j-dark-red)` (depresses to `0 2px 0` on active press).
- **Badge Shadow:** `box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4)` on chip tags and spinner values.
- **Modal Overlay:** `background: rgba(8, 18, 22, 0.55)` with centered grid positioning.

### Named Rules
**The Zero-Blur Depth Rule.** Soft atmospheric gaussian blurs belong to generic web apps. Jimbo depth uses zero-blur solid offsets that feel like molded plastic arcade components.

## Shapes

- **Radius Scale:** Tight pixel-radius hierarchy: `3px` (small badges), `6px` (buttons, cards), `10px` (modals, filter bars), and `999px` (progress tracks, tally pills).
- **Clean Corners:** Never pair single-sided thick borders with rounded corners. Use south-edge `box-shadow` to preserve pristine geometry.

## Components

### Buttons (`JimboButton`)
- **Shape:** Rounded rectangle (`6px` radius).
- **South Lip:** `4px` solid dark lip.
- **States:** Hover lifts by `-2px`; active/press shifts down by `+2px` with a reduced `2px` lip.

### Cards (`StandardCard`, `GameCard`)
- **Shape:** Authentic Balatro card geometry (`6px` radius).
- **Sprite Mapping:** Parameterized via CSS custom properties (`--j-card-width`, `--j-card-height`).

### Filter Bar (`JimboFilterBar`)
- **Input & Select:** Inset dark field with `10px` radius and `4px` solid south edge shadow.

## Do's and Don'ts

### Do:
- **Do** use `display: grid` for all container layouts and button alignment.
- **Do** compose reusable `Jimbo*` primitives from `src/ui/`.
- **Do** use `react-icons` (preferably `react-icons/fi`) for all iconography.
- **Do** use exponential deceleration (`cubic-bezier(0.16, 1, 0.3, 1)`) for UI state transitions.

### Don't:
- **Don't** use `display: flex` or any `flex-*` property anywhere in `src/`.
- **Don't** use `fontWeight: bold` or uppercase shouting text.
- **Don't** use single-side thick borders on rounded containers; use `box-shadow: 0 Npx 0 ...`.
- **Don't** use rubber-band bounce overshoots (`> 1.0` bezier values).
- **Don't** use emojis in UI controls.
