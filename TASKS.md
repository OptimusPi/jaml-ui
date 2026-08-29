# jaml-ui — open work

Jimbo lives in `src/ui/`. Design write-hooks are gone. This list is live work, not the old Storybook backlog.

## Open

- **`D:\jaml-seedfinder-mcp` is the searcher host**, not mystery. MCP App iframe:
  `JamlIde` + `motely-wasm` `MotelySearch` in `src/mcp-app.tsx`. Pins `jaml-ui@4.3.0`.
  The searcher UI lived there / in seedfinder SeedLab `SearchPanel.jsx`. This package
  only gets Search if the host passes `onSearch`. Harvest next: wire searcher into
  `JimboDock` Search pane, not another IDE tab.


- **41% of `jimbo.css` is unreferenced.** 243 of 595 `.j-*` classes are never
  used by any `.ts`/`.tsx` in `src/`, stories included (template-built names
  like `` `j-btn--${size}` `` are counted as live, so this is the conservative
  number). It is not scattered leftovers — it is 74 whole BEM blocks, entire
  component systems that exist only as CSS: `j-showcase` (23 classes),
  `j-filter-browser` (16), `j-panel-spinner` (11), `j-code-block` (8),
  `j-progress` (8), `j-tooltip` (7), `j-filter-bar` (7), plus `j-slider`,
  `j-toast`, `j-stepper`, `j-dual-chip`, `j-marquee`, `j-stat-grid`…
  **Not deleted yet on purpose:** `jimbo.css` is a published entry
  (`jaml-ui/jimbo.css`) and seedfinder.app may style against these class names
  directly, so this is a breaking change, not a cleanup. Decide per block:
  either a consumer uses it (then it needs a `Jimbo*` primitive and a story,
  per design rule #8) or nothing does (then it goes). Worth ~90 kB of the
  119 kB stylesheet.

- **CodeMirror ships to every consumer of the main entry.** `dist/index.js` is
  881 kB (238 kB gzip) and roughly a third of it is bundled
  `@codemirror/{view,state,language,autocomplete,commands,lint}` + `@lezer`,
  pulled in by `JamlCodeEditor` / `JamlIde`. Those are **devDependencies** and
  are not in `PEER_EXTERNALS`, so Rollup inlines them: an app that imports
  nothing but `JimboButton` still downloads a full code editor unless its own
  bundler manages to tree-shake the built file. The fix is a separate
  `jaml-ui/editor` export so the editor is opt-in — that changes the public
  API, so it needs a version bump and a call on who currently imports what.

- **In-app JAML authoring help.** No live guidance surface anywhere — no
  inline hints, no hover docs, no "why did this fail" surfaced from
  `jaml-codemirror`'s diagnostics beyond raw squiggles. This is the concrete
  ask behind "make JAML authoring more helpful" — build it, don't look for a
  half-finished version.
  **Note (2026-08-14):** this task used to point at `examples/mcp-seed-finder`
  / `examples/seed-finder` and `SeedFinderApp.tsx`. **There is no `examples/`
  directory in this repo** — only stale `.gitignore` entries and a `dts`
  exclude for `SeedFinderApp.tsx` / `McpSeedFinderApp.tsx` remain. Find the
  live consumer (seedfinder.app) before starting; do not go looking for those
  paths here.
- **Unify vocab sourcing between `jaml-codemirror` and `jaml-lsp`.** Both
  packages independently call `MotelyJaml.listItems(kind, "")` from their own
  `vocab.ts`. They already drifted once (the `Any`-wildcard fix landed twice,
  separately, in commit `4e88c2f`). Extract one shared vocab module (a new
  small package, or fold into `jaml-lang`) both packages import, so the next
  fix doesn't need to happen twice.
- **`MotelyJamlyzer.analyzeSeeds` perf cliff.** Ante 8 ≈ 3ms, ante 39 hangs
  the tab past 30s (synchronous, computes every ante any clause references).
  `analyzeSeedsPaged`/`resumeSeeds` hit the identical wall. This is a Motely
  (C# engine) fix, tracked here because it blocks anything in this repo that
  wants to jamlyze past ~ante 10 without a client-side ante clamp.
- **`JamlyzerView` ante-0 gap.** Caps `maxAnte=8`, generates ante buttons
  `1..n` and never `0`. Not swapped in anywhere yet (seedfinder.app's
  hand-rolled X-ray does ante-0 correctly and is used instead) — fix before
  the next consumer reaches for this component.

## Closed 2026-07-06

- 5 lint errors (`packages/jaml-codemirror`, `packages/jaml-lsp`, one stray
  `@storybook/react` import).
- `pnpm typecheck` gap — added `typecheck` scripts to all three `packages/*`
  members plus a root `pnpm typecheck:all`.
