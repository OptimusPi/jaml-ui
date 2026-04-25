# TODO

Things we've deferred. Light tracking, not a backlog system.

## Validation / warnings

- [ ] **Warn on removed/ante-8 finisher bosses in JAML clauses.** v13 dropped `AmberAcorn`, `CeruleanBell`, `CrimsonHeart`, `VerdantLeaf`, `VioletVessel`, `TheClub` from `MotelyBossBlind`. If a user writes `boss: AmberAcorn` in a `.jaml` file today, the analyzer silently won't match — better to surface it in the IDE as an underline/squiggle. Hook spot: `src/utils/jamlMapPreview.ts` (or a sibling validator). User is *usually* smart enough to know, so low priority.
- [ ] **Empty-zone hint instead of nothing.** When a zone has 0 clauses, the analyzer still runs but the user has no signal that "should: []" is meaningless for scoring. Show a faint hint in the IDE.

## V2 design ports remaining

The Claude-designed V2 mockups live at `assets/Balatro Seed Curator (DesignsV2)/src/v2/`. Already shipped: `JamlMapPreview` (zone rails) + `JamlIdeVisual` (cards + ADD tiles, no picker yet).

- [ ] **`PickerSheet`** (cascade category → item → antes/score bottom sheet). Wires into `JamlIdeVisual.onAddClause` / `onEditClause`. ~250 LOC of new component territory. **Biggest remaining piece** of the V2 design.
- [ ] `AntePageV2.jsx` → analyzer ante view (replaces or augments `AnalyzerExplorer`)
- [ ] `SearchResultsV2.jsx` → results list
- [ ] `SeedDetailV2.jsx` → seed detail page
- [ ] `SeedOGCard.jsx` → social share card
- [ ] `Showcase.jsx` → design system showcase

## Library debt

- [ ] **Unify the two JAML parsers.** `src/utils/jamlMapPreview.ts` (`extractVisualJamlItems`) and `src/utils/jamlVisualFilter.ts` (`jamlTextToVisualFilter`) re-parse clauses with near-identical regex. Extract one `parseJamlClauses(text)` and have each consumer project to its output type. ~80 LOC saved.
- [ ] **Extend `extractVisualJamlItems` to capture `antes` / `score` / `edition`** so the JAML MAP preview pills can show those badges (currently they're sprite + name only). Today only the visual builder side has them.
- [ ] **`Layer` and `JamlCardRenderer` are still in the public API** even though no consumer uses them externally — they're internal render bookkeeping. Three-line removal from `index.ts` + `core.ts` (we backed out of doing this earlier when scope creep hit). Truly breaking but small.
- [ ] **Verify the iPad keyboard widget CSS hide actually works on iOS chat WebView.** The `.iPadShowKeyboard` selector targets Monaco's contrib widget; if the icon in the screenshots is iOS system chrome instead, this CSS is a no-op and a different fix is needed. Smoke test: deploy demo to GH Pages, open on iOS in a chat WebView.

## Watch list

- [ ] **motely-wasm finisher bosses.** If they reappear in a future version (possibly under a new `MotelyFinisherBoss` enum since they're ante-8-only and behave differently), add the entries back to `BOSS_ENTRIES` in `src/motelyDisplay.ts`. Current `runtimeEnumKey` guards keep things from crashing in the meantime.
- [ ] **Stake/deck enum drift.** `useAnalyzer` reads `Motely.MotelyDeck.Red` and `Motely.MotelyStake.White` directly. If those constants get renamed, the analyzer silently falls back. Add a startup assertion (or a typecheck) when motely-wasm bumps.

## Demo / deploy

- [ ] **Flip GitHub Pages source to "GitHub Actions"** in repo settings (one-time, can't be done from a workflow). Without this the deploy job fails with "Pages site not found" on first run.
- [ ] **README badge** for the Pages deploy status once the workflow is green.

## MCP server

Out of jaml-ui's scope but tracked here so we don't forget.

- [ ] **Locate the actual MCP server source.** Where does `Balatro Seed Curator` get its tool definitions? Separate repo? Embedded somewhere? Need that path before any real work.
- [ ] If/when we touch it: install the `mcp-server-dev` plugin (`/plugin install mcp-server-dev@anthropics`) for the proper skill/scaffolding workflow rather than vibe-coding.
