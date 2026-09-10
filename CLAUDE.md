# jaml-ui

Balatro-styled component library, published to npm as `jaml-ui`. Owner: pifreak / OptimusPi.
Windows, pnpm 10.

## Architecture — read this before you change anything

**JAML is declarative.** A JSON document describes the UI; a renderer turns it into r3f.
It is not hand-written React components with props, and must not become that. Every model
that touches this project quietly "simplifies" it back into ordinary components and calls
that good engineering. If the declarative layer is awkward, **fix the declarative layer.**

**No barrel files.** An entry whose body is `export ... from` is glue. Entries point at
modules that hold actual code. `src/core.ts` used to be exactly this — 33 lines of
re-exports, imported by nothing, hiding four real modules behind one meaningless name.
It's gone. If a new symbol needs publishing, give it a subpath aimed at its real module.

**r3f on purpose.** Don't propose DOM instead, or a spring integrator instead of physics.

## Entries

| subpath | source | boundary |
|---|---|---|
| `jaml-ui` | `src/index.ts` | `"use client"` |
| `jaml-ui/ui` | `src/ui.ts` | `"use client"` — the Jimbo design system |
| `jaml-ui/sprites` | `src/sprites/spriteData.ts` | server-safe |
| `jaml-ui/assets` | `src/assets.ts` | server-safe |
| `jaml-ui/motely` | `src/decode/motelyItemDecoder.ts` | server-safe |

`index` and `ui` are curated export lists — that's the product, not glue. The other three
carry no React and must never be client-marked: `CLIENT_ENTRIES` in `vite.config.ts` is a
two-item allowlist, and banner a decoder entry and every server caller dies with
"decodeMotelyItemName is on the client". That's what took the MCP JAMLyzer down.

`vite-plugin-dts` mirrors the source tree while `entryFileNames` flattens the JS, so a
nested entry's declarations land at its source path. `package.json` types point there.
Don't generate shim `.d.ts` files to make the paths match — that's a barrel too.

Sprite sheets and the m6x11plus font ship as **real files, not base64**. The reasoning is
in the comment at the top of `vite.config.ts`. Hard-won. Don't undo it.

## Rules

- Don't say "fixed", "working", or "restored" unless it is literally true. Say what you
  verified. A passing typecheck is a passing typecheck, not a working build.
- A denied tool call means stop and change approach. Not retry. Not retry quieter.
- **Don't publish to npm.** `npm whoami` is 401; he logs in himself. Versions are permanent.
- Typos, caps, and profanity are register. Don't adjust your tone in response.
- Build for him specifically: whimsy, his voice, his handle in the work. globals.lua
  correctness is table stakes, not the deliverable. If it could have been built for
  anyone, it's wrong.

## Known bug — different repo, not this one

`recursive use of an object detected which would lead to unsafe aliasing in rust`, thrown
from `removeRigidBody`/`removeCollider` during destroy cleanup, ending in a lost WebGL
context. Rapier's wasm re-entrancy guard: something calls into the world while it's
already borrowed. Read the teardown path before theorizing. jaml-ui has no
three/r3f/rapier dependency — that stack lives elsewhere.

## Open

- `vite.config.ts` `onwarn` filters `MODULE_LEVEL_DIRECTIVE` and `SOURCEMAP_ERROR`. The
  zod build noise is `INVALID_ANNOTATION` from node_modules — one more condition silences
  it. Trivial, unstarted.
- `dist/ui/jimbo.css` is ~130KB. Known, unaddressed.

o7
