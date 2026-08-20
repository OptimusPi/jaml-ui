# jaml-ui

Balatro card sprites + the Jimbo design system, for MCP Apps — with a generative-UI catalog for [Vercel Labs' json-render](https://github.com/vercel-labs/json-render).

## What's inside

- **json-render catalog** — `src/json-render` is a catalog + registry for [`@json-render/core`](https://www.npmjs.com/package/@json-render/core) / [`@json-render/react`](https://www.npmjs.com/package/@json-render/react) (by Vercel Labs — not ours). It maps the Jimbo primitives and Balatro sprites into a zod-typed catalog an LLM can emit specs against, and `JimboJsonRenderer` renders those specs inside `JimboApp`.
- **Balatro card sprites** — canvas-based `JamlGameCard`, `StandardCard`, `DeckSprite`, plus sprite metadata.
- **Jimbo design system** — ~36 `Jimbo*` primitives in `src/ui` over `jimbo.css`, all grid-based. See the design rules in `CLAUDE.md`: no flex anywhere, because MCP host iframes size flex content differently per host.

## Install

```bash
npm install jaml-ui motely-wasm react react-dom
```

`motely-wasm` is a peer dependency — boot it once before rendering.

## Quick start — render a json-render spec

```tsx
import { JimboJsonRenderer } from "jaml-ui";
import "jaml-ui/jimbo.css";

// A @json-render spec (flat element map) — normally produced by an LLM
// constrained to `jimboCatalog`.
const spec = {
  root: "panel",
  elements: {
    panel: { type: "JimboPanel", props: { title: "Hello" }, children: ["text", "card"] },
    text: { type: "JimboText", props: { text: "Seed: ALEEB", size: "lg" }, children: [] },
    card: { type: "JamlGameCard", props: { name: "Blueprint", type: "joker" }, children: [] },
  },
};

export default function App() {
  return <JimboJsonRenderer spec={spec} />;
}
```

`jimboCatalog` / `jimboRegistry` are exported too if you want to drive `@json-render/react`'s `Renderer` yourself.

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
| `jaml-ui` | Card components, JAML IDE / JAMLyzer / Ante Map screens, `jimboCatalog` + `JimboJsonRenderer` for `@json-render` |
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
