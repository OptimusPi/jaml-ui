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
  iframe.html + ds-fonts/ — run `node .design-sync/inject-reference-fonts.mjs`
  after EVERY reference rebuild (committed, idempotent).

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

## grading methodology, wave 2 (overlay/animation/screen class, 2026-08-18)
- Negative-z backdrops (fixed/absolute canvases like JimboBackground's swirl) go
  invisible under the JimboBox provider's opaque background inside the card's
  transformed wrapper. Minimal fix: `isolation: isolate` wrapper in the owned
  preview — never neutralize story state for it.
- Opacity-keyframe cross-fades (JimboBalatroFooter suit icons) can freeze at an
  all-transparent phase on BOTH panels under the capture clock — an identical
  "missing element" on both sides is a stabilization artifact, same class as
  WebGL swirl phase. Grade match with a note.
- Transparent thin-wrapper primitives (JimboBox/Canvas/Inline/Link) render
  nothing of their own: 100% of visible delta is backdrop framing. Pixel-measure
  content bboxes/colors; grade the content only.
- Self-scrolling components inside scroll-snap-mandatory + smooth containers
  (JamlMapEditor's ante rail) are load-order sensitive: judge the SETTLED state;
  owned wrapper re-applies the component's own scroll target with
  behavior:"instant" on rAF + ResizeObserver. Snap position includes scroll
  padding (675, not children[1].offsetTop).
- A component file whose basename matches no exported name (GameCard.tsx →
  JamlGameCard) escapes the ds-import-policy shim; story relative-imports then
  bundle the raw source chain (fatal when it touches motely-wasm). Fix: owned
  preview importing from the package barrel (see previews/JamlGameCard.tsx).
- When the sb REFERENCE itself is broken (JamlCardRenderer's draw-before-resize
  race wiped canvas layers in the static build — proven by drawImage
  instrumentation), the preview rendering MORE is the correct render: grade
  close with evidence and fix the SOURCE, never degrade the preview to match.
  → Fixed in source 2026-08-18 (useJamlCardRenderer full-stack redraw on image
  load, in-flight dedupe); sb-reference rebuilt; JamlGameCard re-graded.
- JimboOrbitalMenu's gold tone renders as bare dark text on BOTH panels
  (JammyOrbitalMenu's gold pill is fine) — component-source quirk, ticket-worthy,
  not a sync defect.

## Re-sync risks
- make-ds-dist.mjs greps exact minified patterns (`"motely-wasm"`, the
  new URL(...).href shape) — a vite/rollup upgrade that changes emission breaks
  the patch silently; the [ASSETS_BLOCKED]/blank-sprite signature is the tell.
- The reference-parity injection is scripted (inject-reference-fonts.mjs) but
  still a separate step; a re-sync that rebuilds sb-reference and forgets to run
  it will "fail" JetBrains-font comparisons spuriously.
- jaml-ui source fixes (exports, fonts, fullWidth face, canvas-layer redraw in
  useJamlCardRenderer) live on PR #43 — a fresh clone without them regresses the
  bundle AND the sb reference (blank card faces return).
- Owned previews now include JamlGameCard (imports package barrel to dodge the
  GameCard.tsx basename-shim gap), JimboBackground (isolation wrapper), and
  JamlMapEditor (instant-scroll settle) — upstream renames/API changes break
  them first.

## grading methodology (folded from wave-1 learnings, 2026-08-18)
- Translucent surfaces (rgba fills, disabled opacity) read as DIFFERENT COLORS on
  the two panels — alpha over the sb swirl vs the flat #0c1818 stage. Pixel-sample
  and compute the blend before grading; it's framing, not a component delta.
- sb raws crop flush at (0,0) to tight content height: bottom hairlines/rules get
  clipped at the last row and look "preview-only". Check the same relative offset
  before calling mismatch.
- Story-grid gaps let the sb swirl show through and read as phantom red elements
  in thin strips — judge from raws.
- Sheet downscaling hollows out small solid-fill tiles — always Read raw PNGs
  before diagnosing fill/color mismatches on small elements.
- Full-bleed stories: the dark ring around the preview side is the JimboBox
  provider padding, not a component border; measure the surface bbox.
