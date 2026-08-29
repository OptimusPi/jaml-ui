# Harvest dump — delete 19, keep 1

Copies only. Flex/raw HTML. **Do not import from `src/`.** Port what you keep into `Jimbo*` + grid.

## seedfinder.app (`lib/mcp/client/seedlab`)

| Keep? | File | Why |
|---|---|---|
| | SearchPanel.jsx | Live searcher — next dock Search pane |
| | FilterPanel.jsx | MUST/SHOULD/MUST NOT chip row |
| | JamlyzePanel.jsx + card-blocks.* | Shop belt inspect (port as column-flow, not wrap) |
| | JamlyzeAnalyzer.jsx | Seed field + clip chip around JamlyzerView |
| | FilterBrowser.jsx | Community JAML library |
| | Picker.jsx | Category → item → ante 0–39 → score |
| | ResultsPanel.jsx + results-triage.css | Skip/keep deck |
| | WelcomeMat.jsx | Clipboard greeting |
| | ItemTile.jsx | Name → sprite |

## WeeJoker.app (`ErraticDeckAppOLD`)

Daily ritual phone app. Not SeedLab.

| Keep? | File | Why |
|---|---|---|
| | DailyRitual.tsx + DayNavigation.tsx | Day carousel (not DailyRitualView panel) |
| | SeedCard.tsx | Ante joker rail (proto belt) |
| | HowToPlay.tsx | Ritual copy |
| | FilterBar.tsx + Explorer.tsx | Orphan archive searcher |
| | ritual.config.json | Weekday themes |
| | AdRotator / WeeWisdom | Wisdom rotator |

## Already in jaml-ui

Dock, OuterTab, footer, swirl knobs, Visual, Map, Jamlyzer dump.

## Husks (you are not crazy)

| Path | What it is |
|---|---|
| `D:\seedfinder.app-prev` | `.gitignore` only. No source. |
| `D:\seedfinder.app-prev2` | Empty folders + `package.json` (workflow 5 beta). Source deleted. |

Live `D:\seedfinder.app` is the only full tree. `-prev` names are leftover skins.

## Added this pass (from live, harvest was incomplete)

- `harvest/orbital/jammy-orbital/` — real radial nav (JimboOrbitalMenu is a 67-line stub)
- `harvest/seedfinder/OrbitalShell.jsx`, `LabBackFoot.jsx`, `MapEditor.jsx` (live-doc merge)
- `catalog.js`, `jaml-clauses.js`, `format.js`, `seedlab.css`, `dock.js`
- `jamlyze-page.jsx`

## JAMMY (`D:\JAMMY`) — pulled the plug, 2000 commits, $2000

Ancestor of `harvest/orbital`. **Not your fault.** V0 yolo sanded a real ring into chat chrome.

“Magnetic swipe” is three organs, none are spring physics:

1. Orbital snap (RadialMenu) — already in harvest/orbital; `src` still has the 67-line stub
2. SeedOverview threshold swipe — `harvest/jammy/SeedOverviewScreen.tsx`
3. **Embla seed hand** — `harvest/jammy/SeedPageClient.tsx` (`SeedHandCarousel`) — only real detent
4. Shop belt that **follows the finger** — `harvest/jammy/AnalyzerShopQueueStrip.tsx` + `useShopStream.ts`

Skip: shadcn, ai-elements, Drive highway (separate product), SCANNING dashboard.

## `D:\jaml-seedfinder-mcp`

Searcher **host**: `JamlIde` + `motely-wasm`. Not copied. Pins old jaml-ui.
