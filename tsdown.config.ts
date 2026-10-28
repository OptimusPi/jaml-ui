import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig } from 'tsdown';

/**
 * Emit imported assets (sprite sheets, the m6x11plus font) as real files
 * instead of inlining them, and return the hashed URL per containing chunk.
 *
 * `import.meta.ROLLUP_FILE_URL_<ref>` is resolved by Rolldown per chunk, so a
 * reference that lands in `dist/chunks/spriteMapper-*.js` gets `../assets/…`
 * while one in `dist/assets.js` gets `./assets/…`. It emits as
 * `new URL("…", import.meta.url).href`, which Vite, webpack 5 and a plain
 * browser ESM import all resolve.
 */
const ASSET = /\.(png|ttf|woff2?)$/;

function emitAssetsAsFiles() {
  return {
    name: 'jaml-emit-assets-as-files',
    async load(this: any, id: string) {
      const file = id.split('?')[0];
      if (!ASSET.test(file)) return null;
      const referenceId = this.emitFile({
        type: 'asset',
        name: basename(file),
        source: await readFile(file),
      });
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
    },
  };
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tokens: 'src/tokens.ts',
    ui: 'src/ui.ts',
    sprites: 'src/sprites/spriteData.ts',
    assets: 'src/assets.ts',
    motely: 'src/decode/motelyItemDecoder.ts',
    motd: 'src/motd/motd.ts',
  },
  plugins: [emitAssetsAsFiles()],
  format: 'esm',
  platform: 'neutral',
  dts: true,
  unbundle: true,
  clean: true,
  deps: {
    neverBundle: [
      /^react($|\/)/,
      /^react-dom($|\/)/,
      /^@base-ui\/react($|\/)/,
      /^motely-wasm($|\/)/,
      /^@rewaffle\/bootsharp-file-system($|\/)/,
    ],
  },
  outputOptions: {
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
    assetFileNames: (info: { name?: string }) =>
      info.name?.endsWith('.css') ? 'ui/jimbo.css' : 'assets/[name]-[hash][extname]',
  },
  copy: [
    { from: 'src/styles', to: 'dist' },
    { from: 'assets', to: 'dist/ui' },
    { from: 'assets', to: 'dist' },
  ],
});
