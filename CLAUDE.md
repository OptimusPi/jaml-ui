# jaml-ui

JAML is **Jimbo's Ante Markup Language** — a DSL for Balatro seed filters. This package is
its UI: a video-game interface that ships **as an MCP app first**, rendered inside a host
iframe we do not control.

## Package manager

Package manager is **pnpm** (see `pnpm-lock.yaml`). Never run
`npm install <pkg>` to add/remove a dependency — it generates a stray `package-lock.json`
that conflicts with the committed pnpm lockfile. Use:

- `pnpm add -D <pkg>`
- `pnpm remove <pkg>`
- `npm run build` / `npm publish` are fine — those just run existing package.json scripts.

## Build

Two build entries are client boundaries: **`src/index.ts` and `src/ui.ts`**. They declare
`"use client"`, but Vite's library build strips module-level directives when bundling —
verify `dist/index.js` and `dist/ui.js` still start with `"use client";` after any
vite.config.ts change (see `CLIENT_ENTRIES` and the `banner` option in
`rollupOptions.output`), or Next.js's RSC compiler will silently treat them as Server
Components and crash on any hook use.

**`src/motely.ts` must NOT get the banner**, and neither must `core.js` or the shared
chunks. `motely.ts` exports pure enum decoders and re-exports `motely-wasm`, which runs
in Node and the browser alike — no React, no hooks, no client boundary. Marking it client
kills every server caller that imports `decodeMotelyItemName` through it, which is what
took the MCP JAMLyzer down once already. `dist/motely.js` starting *without*
`"use client"` is correct, not a regression to fix — see the comment above
`CLIENT_ENTRIES` in `vite.config.ts`.

## Design tokens

Tokens live in `src/ui/jimbo-tokens.css` as `--j-*` custom properties. Before adding one, check
whether an existing token covers it. A token earns its place by being **re-themed or
re-used**; a custom property that is set once and read once is just a variable with extra
steps, and it makes the stylesheet harder to hold in your head. Prefer a literal value
over a single-use token. Do not add more space tokens to “fix” width.
