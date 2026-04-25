import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// On GitHub Pages the app is served under https://<user>.github.io/jaml-ui/.
// Locally Vite serves at the root. The DEMO_BASE env var lets CI override.
const base = process.env.DEMO_BASE ?? "/";

export default defineConfig({
  root: __dirname,
  base,
  plugins: [react()],
  resolve: {
    alias: {
      // Map every public entry point of jaml-ui back to its source so the demo
      // can import without needing a build step.
      "jaml-ui/core": resolve(__dirname, "../src/core.ts"),
      "jaml-ui/motely": resolve(__dirname, "../src/motely.ts"),
      "jaml-ui/ui": resolve(__dirname, "../src/ui.ts"),
      "jaml-ui/r3f": resolve(__dirname, "../src/r3f.ts"),
      "jaml-ui": resolve(__dirname, "../src/index.ts"),
    },
  },
  build: {
    outDir: resolve(__dirname, "../dist-demo"),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    open: true,
  },
});
