import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/apps/**/*.stories.tsx",
    "../src/json-render/**/*.stories.tsx",
    "../src/ui/**/*.stories.tsx",
    "../src/components/**/*.stories.tsx",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...new Set([...(config.optimizeDeps?.exclude ?? []), "motely-wasm"])],
    };
    return config;
  },
};

export default config;
