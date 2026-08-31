# Harvest — closed 2026-08-31

`harvest/` was a staging dump of UI copied out of three dead or half-dead trees so it
could be triaged into jaml-ui without importing from them. It is **gone now**, on purpose:
every file below has a verdict. Nothing was deleted without one.

The files are all still in git — `git show 86b0a69:harvest/<path>` brings any of them back.
This file exists so you never have to guess *why* one is not in `src/`.

The rule that decided every row: **jaml-ui owns design-system primitives.** App screens,
app state, and app data are not primitives, however good they are.

## Kept — the one real port

`harvest/orbital/jammy-orbital/` (`@pifreak/jammy-orbital`, 15 files) was the *actual*
orbital menu running in seedfinder.app, while jaml-ui exported a 67-line
badges-on-a-circle stub of the same name that nothing imported. That inversion is what
this harvest existed to fix.

| Harvested | Landed in |
|---|---|
| `radialLayout.ts` | `src/ui/orbitalLayout.ts` — pure math, verbatim behavior |
| `radialMenuStore.ts` + `useRadialMenu.ts` | `src/ui/orbitalMenuStore.ts` |
| `RadialMenu` / `Pill` / `Button` / `Badge` / `Breadcrumb` | `src/ui/JimboOrbitalMenu.tsx` |
| `types.ts` (item model + color semantics) | `JimboOrbitalMenuItem` |
| `palette.ts` | already `src/ui/jimbo-tokens.css` — only `--j-dark-purple` was missing |
| `styles.css` (21 KB) | the ~90 lines the ring uses, in `src/ui/jimbo.css` |

Rewritten, not pasted, on four counts:

- **Tailwind + `clsx` + `tailwind-merge` are gone.** jaml-ui has none of them.
- **`display: flex` is gone.** Every row is grid — the iframe determinism rule.
- **`zustand` is gone.** The store's own comment says component state loses the open
  menu when the mascot remounts, and that is true, so the state stayed outside the
  component — as a plain `useSyncExternalStore` store instead of a dependency. It is
  also *instanceable* now, which the global was not: two rings on one Storybook docs
  page used to drive each other.
- **Pills compose `JimboButton`** rather than reimplementing the south-edge lip.

Not ported, deliberately:

- `Mascot.tsx` (16 KB) — `JimboMascot` already owns the artwork; `OrbitalShell.jsx` in
  seedfinder.app was already wiring jaml-ui's mascot to this package's *behavior*, so
  only the behavior was missing.
- `useRadialViewportGeometry.ts` — on-screen-keyboard dodge and viewport width. That is
  a host concern, not a primitive; `JimboOrbitalMenu` takes `translateY` and `boxHeight`
  so a host can feed it whatever geometry it measures.
- `SeedCarousel.tsx` → `JimboSwipeDeck` + `JimboShopBelt` cover it.
- `assets/m6x11plus.ttf` — `assets/fonts/m6x11plus.ttf` already ships. The harvest copy
  is a *different, larger* build of the same face (48 KB vs 18 KB); if glyph coverage
  ever bites, that is where the fuller one lives.

## Deleted — already in jaml-ui

| Harvested | Already here |
|---|---|
| `jammy/AnalyzerShopQueueStrip.tsx`, `jammy/useShopStream.ts` | `JimboShopBelt` (drag follows the finger, wheel maps to x) |
| `jammy/SeedOverviewScreen.tsx` | `JimboSwipeDeck` (threshold swipe, keep/pass/undo) |
| `jammy/Card.tsx` | `GameCard`, `StandardCard`, `DeckSprite` |
| `jammy/shader-themes.ts` | `JimboBackground` config (the swirl takes a palette) |
| `jammy/RadialNavigation/*` | the *ancestor* of `harvest/orbital` — same components, one generation older, still importing `@/components/jammy/menuConfig`. Superseded by the port above. |
| `weejoker/DailyRitual.tsx`, `DayNavigation.tsx`, `ritual.config.json` | `DailyRitualView` + `src/lib/daily/ritual.ts` |
| `weejoker/SeedCard.tsx` | `jamlyzer/JamlyzerSeedCard` + `JimboShopBelt` |
| `seedfinder/MapEditor.jsx` | `src/components/jamlMap/JamlMapEditor` |
| `seedfinder/Picker.jsx` | `JimboPicker` + friends |
| `seedfinder/dock.js` | `JimboDock` / `dockTree.ts` |
| `seedfinder/JamlyzeAnalyzer.jsx` | `JamlyzerView` + `JamlSeedInput` + `JimboSeedCopyChip` |
| `seedfinder/ItemTile.jsx` | `JimboSprite` + `src/decode/motelySprite.ts` |
| `seedfinder/card-blocks.*`, `results-triage.css`, `seedlab.css` | `jimbo.css` + `jimbo-tokens.css` |

## Deleted — not a design system's job

These are **app screens and app state**, and they are all still live and maintained in
`seedfinder.app/lib/mcp/client/seedlab/`. Copying them here would have created a second
copy of a file that already has an owner.

`SearchPanel.jsx` (live searcher) · `FilterPanel.jsx` (MUST/SHOULD/MUST NOT chips) ·
`ResultsPanel.jsx` (skip/keep deck) · `FilterBrowser.jsx` (community JAML library) ·
`WelcomeMat.jsx` (clipboard greeting) · `JamlyzePanel.jsx` (shop belt inspect) ·
`OrbitalShell.jsx` · `LabBackFoot.jsx` · `jamlyze-page.jsx` · `catalog.js` ·
`jaml-clauses.js` (line-splice editing) · `format.js` ·
`weejoker/HowToPlay.tsx`, `FilterBar.tsx`, `Explorer.tsx`, `AdRotator.tsx`, `WeeWisdom.tsx`

If a *primitive* is ever found hiding inside one of them, lift the primitive — not the screen.

## Deleted — one judgment call

`jammy/SeedPageClient.tsx` held `SeedHandCarousel`, an Embla-backed detented seed hand,
and the old manifest called it "the only real detent" in JAMMY. It is not ported:
it needs a carousel dependency jaml-ui does not have, nothing currently consumes it, and
`JimboSwipeDeck` covers seed triage today. If a detented hand is wanted later this is a
deliberate build, not a rescue — start from `git show 86b0a69:harvest/jammy/SeedPageClient.tsx`.

## Deleted — husks

`D:\seedfinder.app-prev` was `.gitignore` only. `D:\seedfinder.app-prev2` was empty dirs
plus a `package.json`. No source in either. Live `D:\seedfinder.app` is the only full tree;
the `-prev` names are leftover skins. You were not crazy.
