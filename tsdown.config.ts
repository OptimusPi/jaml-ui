import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/tokens.ts'],
  format: 'esm',
  platform: 'neutral',
  dts: true,
  unbundle: true,
  clean: true,
  deps: { neverBundle: [/^react($|\/)/, /^react-dom($|\/)/, /^@base-ui\/react($|\/)/] },
  copy: [{ from: 'src/styles', to: 'dist' }],
});
