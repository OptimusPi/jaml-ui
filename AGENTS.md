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

## Commands

- `pnpm storybook`: Storybook on :6006, MCP server at `http://localhost:6006/mcp`.
- `pnpm build`: tsdown (ESM + .d.ts into `dist/`).
- `pnpm typecheck`, `pnpm build-storybook`.

TypeScript is pinned to 6.x: TS 7 has no JS API yet, and Storybook's prop docs need it.
