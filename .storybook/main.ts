import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/react-vite",
  // Serve the sideloaded motely-wasm engine binary at MOTELY_BIN_PATH
  // ("/motely-wasm/bin") so bootsharp.boot(MOTELY_BIN_PATH) can fetch the
  // 9.4 MB motely-wasm.wasm at runtime. Without this it 404s and the runtime
  // never boots — the "renders but nothing searches" failure in a browser.
  "staticDirs": [
    { "from": "../node_modules/motely-wasm/dist/bin", "to": "/motely-wasm/bin" }
  ],
  // Let the Vite dev server answer to any Host header — required when reaching
  // Storybook through a Cloudflare tunnel / custom domain (e.g. *.8pi.me).
  // Without this, Vite rejects the tunnel host and the browser downloads the
  // "Invalid Host" response as document.txt instead of rendering.
  viteFinal: async (viteConfig) => {
    viteConfig.server ??= {};
    viteConfig.server.allowedHosts = true;
    return viteConfig;
  }
};
export default config;