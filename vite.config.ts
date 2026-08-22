import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

/**
 * Emit sprite sheets and fonts as real files instead of base64.
 *
 * Vite's library mode inlines *every* imported asset as a data URI and ignores
 * `build.assetsInlineLimit` while doing it — there is no reliable base path for
 * a library, so it takes the safe route. That put 1.48 MB of base64 PNG (the
 * eleven Balatro sprite sheets; Jokers.png alone is 479 kB) into the JS chunks,
 * costing ~1.09 MB gzipped because base64 barely compresses, all of it parsed
 * as string literals before a single card could draw. The same PNGs were
 * already shipped as real files via `files: ["assets/*.png"]` and the
 * `./assets/*` export, so consumers downloaded the artwork twice.
 *
 * `import.meta.ROLLUP_FILE_URL_<ref>` is the mechanism Vite's own asset plugin
 * cannot use here: Rollup rewrites it per *containing chunk*, so a reference
 * that ends up in `dist/chunks/spriteMapper-*.js` gets `../assets/…` while one
 * in `dist/index.js` gets `./assets/…`. It emits as
 * `new URL("…", import.meta.url).href`, which Vite, webpack 5 and a plain
 * browser ESM import all resolve correctly.
 */
function emitAssetsAsFiles(): Plugin {
  const ASSET = /\.(png|ttf|woff2?)$/;
  return {
    name: "jaml-emit-assets-as-files",
    enforce: "pre",
    apply: "build",
    async load(id) {
      const file = id.split("?")[0];
      if (!ASSET.test(file)) return null;
      const referenceId = this.emitFile({
        type: "asset",
        name: basename(file),
        source: await readFile(file),
      });
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
    },
  };
}

// Entries that really are client boundaries — they export React components and
// call hooks. Vite's library build strips module-level directives when bundling,
// so Next.js's RSC compiler can't see the boundary and tries to render them as
// Server Components, crashing on any hook use (e.g. "useRef is not a function").
// Re-adding the banner to these entries (not shared chunks like core.js or
// spriteMapper) is enough: Next only checks the directive on the module a
// consumer actually imports.
//
// motely.js stays off this list on purpose. It exports pure enum decoders and
// re-exports motely-wasm, a single-file native-LLVM ESM module that runs in Node
// and in the browser alike — no React, no hooks, no client boundary. Banner it and
// every server caller importing decodeMotelyItemName through it dies with
// "decodeMotelyItemName is on the client", which is exactly what took the MCP
// JAMLyzer down.
const CLIENT_ENTRIES = new Set(["index.js", "ui.js"]);

const PEER_EXTERNALS = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  // motely-wasm: externalize so consumers control resolution. Next.js apps
  // get it via npm transitive resolution; the singlefile MCP iframe gets it
  // via an importmap pointing at unpkg (browser fetches once, caches across
  // tool invocations). Bundling here would balloon the iframe HTML.
  "motely-wasm",
  /^motely-wasm\//,
  "@rewaffle/bootsharp-file-system",
];

export default defineConfig({
  plugins: [
    emitAssetsAsFiles(),
    dts({
      entryRoot: "src",
      include: ["src"],
      exclude: [
        "src/**/*.stories.tsx",
        "src/**/*.stories.ts",
        "src/**/*.test.tsx",
        "src/**/*.test.ts",
        // Storybook-only source: pulls in jaml-codemirror, which is a sibling
        // workspace package (not a jaml-ui dependency). Built from source by
        // Storybook directly; never part of the published package.
        "src/components/SeedFinderApp.tsx",
        "src/components/McpSeedFinderApp.tsx",
      ],
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: true,
    // Belt and braces with emitAssetsAsFiles() above: lib mode ignores this,
    // but it states the intent for any non-lib build of this config.
    assetsInlineLimit: 0,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        ui: resolve(__dirname, "src/ui.ts"),
        core: resolve(__dirname, "src/core.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: PEER_EXTERNALS,
      // Rollup warns on every source file whose "use client" it strips (plus a
      // paired sourcemap warning). The banner below re-adds the directive where
      // it matters, so the warnings are pure noise.
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" ||
          warning.code === "SOURCEMAP_ERROR"
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        preserveModules: false,
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (info) => {
          if (info.name?.endsWith(".css")) return "ui/jimbo.css";
          return "assets/[name]-[hash][extname]";
        },
        banner: (chunk) => (CLIENT_ENTRIES.has(chunk.fileName) ? '"use client";' : ""),
      },
    },
  },
});
