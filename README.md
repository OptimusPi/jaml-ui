# jaml-ui

JSON-to-React engine (`json-render`) + Balatro card sprites + the Jimbo design system, for MCP Apps.

## What's inside

- **`json-render`** — a tiny JSON-to-React engine in `src/json-render`, with no dependencies of its own beyond React. A JsonNode tree + a registry = rendered UI. Ships with a Balatro catalog (`Panel`, `Stack`, `Grid`, `SeedCard`, `SearchStats`, `JamlGameCard`, ...).
- **Balatro card sprites** — canvas-based `JamlGameCard`, `StandardCard`, `DeckSprite`, plus sprite metadata.
- **Jimbo design system** — ~36 `Jimbo*` primitives in `src/ui` over `jimbo.css`, all grid-based. See the design rules in `CLAUDE.md`: no flex anywhere, because MCP host iframes size flex content differently per host.

## Install

```bash
npm install jaml-ui motely-wasm react react-dom
```

`motely-wasm` is a peer dependency — boot it once before rendering.

## Quick start — render JSON UI

```tsx
import { render, balatroRegistry } from "jaml-ui";

const spec = {
  type: "Panel",
  props: { title: "Hello" },
  children: [
    { type: "Text", props: { body: "Seed: ALEEB", variant: "title" } },
    { type: "JamlGameCard", props: { type: "joker", card: { name: "Blueprint" } } },
  ],
};

export default function App() {
  return <div>{render(spec, balatroRegistry)}</div>;
}
```

## Boot motely-wasm

`motely-wasm` ships embedded — the boot resources travel inside the module, so `boot()` takes no argument.

```tsx
import bootsharp from "motely-wasm";

if (bootsharp.getStatus() === bootsharp.BootStatus.Standby) await bootsharp.boot();
```

Boot once per JS realm. Each web worker is its own realm, so a worker fleet boots one engine apiece — see the fleet section in the [motely-wasm README](https://www.npmjs.com/package/motely-wasm) for the module-worker and `MessagePort` rules that keep a worker from hanging.

## Package exports

| Entry | What's in it |
| ----- | ------------ |
| `jaml-ui` | json-render engine, Balatro registry/catalog, card components |
| `jaml-ui/ui` | Jimbo design system — every `Jimbo*` primitive plus the CSS tokens |
| `jaml-ui/core` | Sprite metadata, asset URLs, canvas `Layer` — no React, no motely-wasm |
| `jaml-ui/motely` | `bootsharp` + `Motely` re-exports, item decoders |

## Scripts

```bash
pnpm build      # Vite library build → dist/
pnpm dev        # Storybook (the component workbench)
pnpm dev:watch  # vite build --watch, for linking into a consumer app
pnpm typecheck  # tsc --noEmit
pnpm lint       # ESLint + the CSS design-rule check
pnpm lint:css   # rule #1 (no flex) over src/**/*.css on its own
```

## License

MIT — see [LICENSE](LICENSE). Font files in `assets/fonts/` are third-party assets by Daniel Linssen; attribution required when redistributing or displaying the pixel fonts.
