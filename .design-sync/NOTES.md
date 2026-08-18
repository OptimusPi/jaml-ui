# design-sync notes — jaml-ui

Accumulated fixes from the first sync (2026-08-17). Read before any re-sync.

## [GENERAL] build & environment
- pnpm 11 ignores `package.json#pnpm.onlyBuiltDependencies` → esbuild postinstall
  blocked → `pnpm build` fails. Fixed via `pnpm-workspace.yaml` `onlyBuiltDependencies`.
  If it recurs: `pnpm install --dangerously-allow-all-builds` once.
- Chromium: use `DS_CHROMIUM_PATH=/opt/pw-browsers/chromium` (converter deps'
  playwright version ≠ preinstalled browsers; never `npx playwright install`).
- eslint: `.design-sync/**`, `.ds-sync/**`, `ds-bundle/**` are ignored in
  eslint.config.js — without that, `pnpm lint` drowns in sync scaffolding.

## [GENERAL] the motely-wasm problem → make-ds-dist.mjs
- dist externalizes `motely-wasm`; its dotnet.js probes `node:process`/`node:module`
  → converter bundle dies. `.design-sync/make-ds-dist.mjs` (committed, runs from
  cfg.buildCmd) copies dist → `.design-sync/.cache/ds-dist/` and repoints the bare
  specifier at a data-only slice (`generated/modules/index.g.mjs` — real enums,
  dotnet-free) + an inert bootsharp default. cfg.entry points at the copy.
- SAME script inlines all 13 `new URL("../assets/…", import.meta.url).href` refs
  as data: URIs. The iife bundle defines import.meta.url as https://ds-preview.invalid/
  → without inlining, EVERY sprite-bearing component renders blank (measured).

## [GENERAL] fonts
- Components inherited font from .j-app/.j-page → Arial on any bare page
  (storybook included — both compare panels matched wrongly). Fixed IN SOURCE:
  `.j-btn__face { font-family: var(--j-font) }` + a `:where(.j-app, .j-page,
  .j-panel, .j-inner-panel, .j-modal, .j-picker, .j-inset)` context-root rule.
- JetBrains Mono (--j-font-code first choice) never shipped → vendored OFL woff2
  in `.design-sync/fonts/` via cfg.extraFonts. "Roboto Mono" FONT_MISSING warn is
  moot (fallback #2 behind a now-shipping first choice) — accepted substitute.
- Oracle parity: sb-reference rebuild WIPES the JetBrains @font-face injection in
  iframe.html + ds-fonts/ — re-inject after every reference rebuild (scripted in
  the session; candidate for a committed script).

## [GENERAL] provider
- cfg.provider = JimboBox with `background:#0c1818; padding:16` — distilled from
  the .storybook decorator (dark Balatro stage; JimboBackground's WebGL swirl
  deliberately NOT reproduced in cards). White-tone text is invisible without it.

## component facts
- `.j-btn--full` face: was inline-span shrink-wrap; fixed in source (display:block).
- JimboInline/JimboLink stories use `j-text--gold` without `.j-text` base — story
  fixture styling, renders UA font on those two spans in both panels; cosmetic.
- storied-but-unexported primitives (JimboListItem, JimboInlineEdit, JimboPicker
  family, JimboCodeSurface, JimboFlankNav, JimboTabs, JimboSprite, JimboTone type)
  are now exported from src/ui.ts — part of this sync's source diff.
- titleMap carries BOTH spaced and normalized key forms ("Balatro Footer" AND
  "BalatroFooter") — the converter looks up normalized; spaced kept for readers.

## Re-sync risks
- make-ds-dist.mjs greps exact minified patterns (`"motely-wasm"`, the
  new URL(...).href shape) — a vite/rollup upgrade that changes emission breaks
  the patch silently; the [ASSETS_BLOCKED]/blank-sprite signature is the tell.
- The reference-parity injection is manual; a re-sync that rebuilds sb-reference
  and forgets it will "fail" JetBrains-font comparisons spuriously.
- jaml-ui source fixes (exports, fonts, fullWidth face) are uncommitted local
  work until the PR lands — a fresh clone without them regresses the bundle.
