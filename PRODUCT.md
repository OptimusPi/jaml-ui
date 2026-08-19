# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Balatro players, theorycrafters, and seed researchers looking to inspect, filter, simulate, and manipulate game seeds via a tactile, authentic retro-arcade interface. Also developers integrating MCP (Model Context Protocol) apps into AI assistants.

## Product Purpose

`jaml-ui` provides the UI and JSON render engine for JAML (Jimbo's Ante Markup Language) and Motely seed decoders. It renders high-fidelity Balatro game cards, vouchers, jokers, booster packs, ante paths, and seed analysis tools directly inside host AI tools and MCP app iframes.

## Positioning

The only MCP-native Balatro seed analyzer that delivers pixel-perfect CRT/arcade tactile feedback while adhering to strict deterministic layout constraints (zero flex) for absolute iframe host independence.

## Operating Context

- Embedded as an MCP App inside host iframe windows across varying, uncontrolled host widths (e.g. Claude desktop/web, AI IDEs, custom MCP viewers).
- Requires rock-solid deterministic layout rendering with zero layout shifts or reflow anomalies.
- Operates both client-side (React components, Storybook) and headless (Motely WASM item decoders).

## Capabilities and Constraints

- **Zero Flex Layout Constraint:** `display: flex` and all `flex-*` properties are strictly banned throughout `src/`. Layouts must be built with CSS Grid (`display: grid`) or absolute positioning so iframes render identically across all hosts.
- **Client/Server Boundary:** `src/index.ts` and `src/ui.ts` are client boundaries requiring `"use client";`. `src/motely.ts` and `dist/motely.js` must NEVER have `"use client";` to allow headless/Node server execution.
- **Design Primitives:** No raw interactive HTML tags (`<button>`, `<input>`, etc.) outside `src/ui/`. All consumers compose `Jimbo*` primitives.
- **Typography & Weights:** Uses m6x11plus pixel typeface (`--j-font`). No `fontWeight: bold` / 700+; no ALL CAPS shouting.
- **Iconography:** Strict use of `react-icons` (preferring `react-icons/fi`); zero emoji in UI.

## Brand Commitments

- **Jimbo / Balatro Aesthetic:** Authentic CRT arcade gaming feel. Flat color fills with tactile solid-south edge drops (`box-shadow: 0 4px 0 ...`), CRT scanlines, and pixel-crisp card sprites.
- **No Generic AI Slop:** No gradient text, no nested cards, no rubber-band bounce overshoots, no unmotivated glassmorphism.

## Evidence on Hand

- Authentic Balatro sprite sheets in `assets/` and `src/assets.ts`.
- Full JAML AST parser and Motely WASM seed engine (`motely-wasm`).
- Component suite in `src/components` and Storybook stories.

## Product Principles

1. **Deterministic Everywhere:** Iframes do not forgive fluid reflow bugs. CSS Grid and explicit coordinates ensure absolute visual parity in every host.
2. **Tactile Arcade Craft:** Every button, card flip, and spinner must feel like physical arcade hardware without relying on cheap bounce overshoots.
3. **Ruthless Anti-Slop:** Reject median-grade SaaS tropes. Simplicity, contrast, and authentic game character outrank generic templates.
