# jaml-ui

Balatro-style React primitives on Base UI, shared by every JAML site. Change
components here, not in apps.

## Conventions

- Behaviour comes from Base UI (`@base-ui/react`). Don't hand-roll focus traps,
  roving tabindex, popover positioning or ARIA that Base UI already provides.
- Tokens are CSS variables in `src/styles/tokens.css`, mirrored in `src/tokens.ts`.
  Keep the two in sync. Colours are OKLCH.
- All CSS is in `@layer jaml.*`, so app CSS overrides it without `!important`.
- Styling hooks are `j-*` classes plus `data-*` attributes (`data-tone`, `data-size`,
  and Base UI's `data-disabled`, `data-checked`, `data-highlighted`, ...).
- Each component has a story at `src/components/<Name>.stories.tsx`.

## Button spec (Balatro — this is the whole point, do not improvise)

A button is a chunky rounded face in a tone color (`--j-btn-face`), white pixel-font
label, and a hard 4px drop shadow. Feedback copies the game exactly:

- **Hover darkens the face** — `filter: brightness(0.88)`. Never brighten; a lighter
  hover reads as a highlight, not a Balatro button.
- **Press sinks and darkens further** — the face translates down 4px, the shadow
  collapses to none, and the face goes `brightness(0.75)`. Both `:active` and
  `[data-pressed="true"]`.
- **Disabled shows nothing** — no hover, no press feedback.

Implementation lives in `src/ui/jimbo.css` (`.j-btn`, `.j-btn__face`). Tones:
orange, red, blue, green, purple — pick per meaning, don't default everything to
orange. Sizes: xs, sm, md, lg.

`JimboSeedCopyChip` is NOT a button: it is a full-width tap-to-copy ROW (44px tall,
designed for one seed per line). For a compact, inline seed action use
`JimboButton size="xs"` and copy in the click handler.

## Commands

- `pnpm storybook`: Storybook on :6006, MCP server at `http://localhost:6006/mcp`.
- `pnpm build`: tsdown (ESM + .d.ts into `dist/`).
- `pnpm typecheck`, `pnpm build-storybook`.

TypeScript is pinned to 6.x: TS 7 has no JS API yet, and Storybook's prop docs need it.
