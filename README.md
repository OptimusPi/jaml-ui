# jaml-ui

Zero-dependency JSON-to-React engine (`json-render`) + Balatro card sprite rendering for MCP Apps.

## What's inside

- **`json-render`** — a tiny, zero-dep JSON-to-React engine in `src/json-render`. A JsonNode tree + a registry = rendered UI. Ships with a Balatro catalog (`Panel`, `Stack`, `Grid`, `SeedCard`, `SearchStats`, `JamlGameCard`, ...).
- **Balatro card sprites** — canvas-based `JamlGameCard`, `StandardCard`, `DeckSprite`, plus sprite metadata.
- **MCP App example** — `examples/mcp-seed-finder` is a single-file MCP App that talks to an MCP server and renders search results with `json-render`.

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

## MCP App example

```bash
cd examples/mcp-seed-finder
pnpm install
pnpm dev
```

## Chrome WebMCP (`navigator.modelContext`)

Expose any live `JamlIde` instance (or custom page tools) directly to Chrome's browser-native WebMCP API — no `ui://` iframe host or stdio MCP server required:

```tsx
import { JamlIde } from "jaml-ui";

// Registers jaml_validate, jaml_vocab, jaml_completions, jaml_hover,
// jaml_get_document, jaml_set_document, jaml_add_clause, jaml_set_ide_mode
// (plus jaml_run_search / jaml_get_results when wired) with navigator.modelContext.
<JamlIde defaultJaml={filter} webMcp />;
```

Or register your own page tools with the React hook from `jaml-ui/webmcp`:

```tsx
import { useWebMcpTool } from "jaml-ui/webmcp";

useWebMcpTool({
  name: "analyze_seed",
  description: "Analyze a Balatro seed in the current tab.",
  inputSchema: { type: "object", properties: { seed: { type: "string" } }, required: ["seed"] },
  execute: ({ seed }) => analyzeSeed(String(seed)),
});
```

## Package exports

| Entry | What's in it |
| ----- | ------------ |
| `jaml-ui` | json-render engine, Balatro registry/catalog, `JamlIde`, card components, WebMCP hooks |
| `jaml-ui/ui` | Jimbo primitives & CSS tokens |
| `jaml-ui/core` | Sprite metadata, asset URLs, canvas `Layer` — no React, no motely-wasm |
| `jaml-ui/motely` | `bootsharp` + `Motely` re-exports, item decoders |
| `jaml-ui/webmcp` | Zero-dep `navigator.modelContext` adapter, React hooks (`useWebMcpTools`), and JAML tool factories |

## Scripts

```bash
pnpm build      # Vite library build → dist/
pnpm dev        # vite build --watch
pnpm typecheck  # tsc --noEmit
pnpm lint       # ESLint
```

## License

MIT — see [LICENSE](LICENSE). Font files in `assets/fonts/` are third-party assets by Daniel Linssen; attribution required when redistributing or displaying the pixel fonts.
