# Why the seed finder never searched — the two real bugs (motely-wasm v19 → v20)

Found by reading the bootsharp sideloading doc against the installed v20 package.
This is the whole monster. It was never "hard" — it was a stale comment + a major
version bump. Two fixes, both mechanical once named.

## BUG 1 — the boot lies (sideloaded vs embedded)

`src/lib/motely/runtime.ts:~93` says:

```
// motely-wasm is an EMBEDDED build ... so boot() takes no args ...
await bootsharp.boot();
```

**That was true for v19. It is FALSE for v20.** v20 ships the runtime as a separate
**`dist/bin/motely-wasm.wasm` (9.4 MB)** — it is **SIDELOADED**, not embedded. The
bootsharp `boot()` doc: *"When not in embedded mode, resources parameter has to be
specified."* Signature: `boot(resources?: string | BootResources, options?)`.

So `boot()` with no args on v20 → can't find the wasm → runtime never boots →
`useSearch` sits on `BootStatus.Standby` → **search silently does nothing.** Months
of "it renders but nothing happens" = this one line.

**Fix:** hand `boot()` the wasm. Two valid shapes:
- `await bootsharp.boot("/bin")` — a URL ROOT where `motely-wasm.wasm` is *served*
  (the MCP-app/CDN path: esm.sh serves it; or copy `dist/bin/*` to the host's public dir).
- `await bootsharp.boot({ wasm })` — preloaded bytes (`BootResources.wasm: ArrayBuffer | string`).
  For a Vite bundler (Storybook/demo), resolve the file and fetch bytes, e.g.
  `import wasmUrl from "motely-wasm/.../motely-wasm.wasm?url"; const wasm = await (await fetch(wasmUrl)).arrayBuffer();`
  (verify the import path against motely-wasm's `exports` map — it restricts subpaths;
  may need a deep relative path or a copied asset. THIS is the one part to confirm by
  running Storybook, not editing blind.)

Update the lying comment while you're there.

## BUG 2 — v20 renamed the API (the typecheck breaks)

`npx tsc --noEmit` on master lists every site. The renames:

| v19 (jaml-ui calls)                | v20 (actual)                              | files |
|------------------------------------|-------------------------------------------|-------|
| `Program.enableJimmolate`          | `Program.jimmolateEnabled` (bool)         | useSearch.ts, searchWorker.ts, searchPoolWorker.ts |
| `Program.jimmolateProbe`           | `Program.jimmolatePredicate`              | runtime.ts |
| probe takes `MotelySingleSearchContext` | predicate takes `MotelyScoredSeedResult` (semantic change!) | runtime.ts |
| `MotelySingleSearchContext` (type) | **removed** from `motely/motely`          | runtime.ts |
| `MotelyJamlyzerResult` / `...SeedResult` / `MotelySeedAnalysis` | **gone** from `motely/analysis`; v20 has `JamlyzerSnapshot`, `AnteSnapshot`, `SnapshotItem`, `PackSnapshot` | Jamlyzer.tsx, useAnalyzer.ts, useSeedAnalyzer.ts |
| analyzer call (1 arg)              | `jamlyzer(seed, lens: JamlConfig)` — **2 args** | useAnalyzer.ts, useSeedAnalyzer.ts |
| result `.seeds`                    | removed — read `JamlyzerSnapshot.antes` etc. | useSeedAnalyzer.ts |

Also: `src/r3f/Card3D.tsx` — `three` has no types (`@types/three` was dropped from
devDeps on master). Re-add `@types/three` or it's a separate TS error (unrelated to v20).

## Order of execution

1. Fix BUG 1 boot (runtime.ts) → run Storybook → confirm the wasm actually loads
   (`Motely.version()` returns, status leaves Standby). Nail the wasm-passing here.
2. Fix BUG 2 renames (the 7 sites above) → `tsc --noEmit` clean.
3. Open the SeedFinderApp story → a small bounded `startRandom` returns real hits.
   THAT is the working seed finder.

Floor stays safe: published **jaml-ui 1.0.3** (on v19) is untouched on npm. This port
is master moving forward to v20. Nothing about the floor breaks while we do it.
