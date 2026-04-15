# jaml-ui

Balatro rendering components, sprite metadata, and optional Motely helpers for React apps.

`jaml-ui` is the shared UI layer for Balatro/JAML surfaces: low-level renderers, asset helpers, visual JAML previews, and a lightweight browser-first JAML IDE shell.

## Package shape

- `jaml-ui`
  - React/client entry for rendered components and hooks
- `jaml-ui/core`
  - Pure asset helpers, sprite metadata, and decode utilities that do not depend on `motely-wasm`
- `jaml-ui/motely`
  - Optional plain `motely-wasm` helpers for decoding Motely item enums

## Install

```bash
npm install jaml-ui react react-dom
```

If you want the Motely-specific helpers too:

```bash
npm install jaml-ui motely-wasm react react-dom
```

## Quick start

```tsx
"use client";

import { JamlGameCard } from "jaml-ui";

export function Example() {
  return (
    <JamlGameCard
      type="joker"
      card={{
        name: "Blueprint",
        edition: "Foil",
        isEternal: true,
        scale: 1.5,
      }}
    />
  );
}
```

## JAML preview

```tsx
"use client";

import { JamlMapPreview } from "jaml-ui";

export function PreviewExample({ jaml }: { jaml: string }) {
  return <JamlMapPreview jaml={jaml} title="JAML Intent Preview" />;
}
```

## Lightweight JAML IDE shell

```tsx
"use client";

import { useState } from "react";
import { JamlIde } from "jaml-ui";

export function IdeExample() {
  const [jaml, setJaml] = useState("must:\n  joker: Blueprint");

  return (
    <JamlIde
      jaml={jaml}
      onChange={setJaml}
      results={[]}
    />
  );
}
```

## Asset handling

By default, `jaml-ui` resolves its packaged sprite assets from the package `assets/` directory using `import.meta.url`.

If you want to host the assets yourself, set a custom base URL once during app startup:

```tsx
"use client";

import { setJamlAssetBaseUrl } from "jaml-ui";

setJamlAssetBaseUrl("/vendor/jaml-ui/");
```

Reset back to packaged assets with:

```ts
import { clearJamlAssetBaseUrl } from "jaml-ui";

clearJamlAssetBaseUrl();
```

## Core utilities

```ts
import { SPRITE_SHEETS, getSpriteData, resolveJamlAssetUrl } from "jaml-ui/core";

const jokerSheetUrl = SPRITE_SHEETS.jokers.src;
const blueprintSprite = getSpriteData("Blueprint");
const vouchersUrl = resolveJamlAssetUrl("vouchers");
```

## Motely helpers

```ts
"use client";

import { decodeMotelyItemName, motelyItemTypeName } from "jaml-ui/motely";

const itemName = decodeMotelyItemName(0x5001);
const enumKey = motelyItemTypeName(0x5001);
```

## Next.js notes

- The root `jaml-ui` entry is client-oriented and preserves the `"use client"` boundary for component consumers.
- Import pure helpers from `jaml-ui/core` when you want server-safe metadata and asset utilities.
- If you are consuming `jaml-ui` from a local workspace package in a Next.js app, you may need:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["jaml-ui"],
};

export default nextConfig;
```

## Browser-first runtime direction

`jaml-ui` is designed for browser/React consumers. The optional `jaml-ui/motely` entry targets plain `motely-wasm` and does not assume threaded WASM, SAB, or COEP setup.

The built-in `JamlIde` intentionally stays lightweight. Rich editor integrations like Monaco, custom language servers, or extension-host-specific tooling should live in app-level packages on top of `jaml-ui`, not in the base renderer package.
