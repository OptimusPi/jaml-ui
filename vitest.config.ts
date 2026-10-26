import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts: the library build's dts and asset-emitting
// plugins have no business running under the test runner.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
