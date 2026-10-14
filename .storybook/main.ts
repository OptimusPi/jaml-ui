import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes', '@storybook/addon-mcp'],
  staticDirs: [{ from: '../assets', to: '/assets' }],
  typescript: { reactDocgen: 'react-docgen-typescript' },
  async viteFinal(config) {
    // motely-wasm is a single-file ESM module that ships its own wasm; Vite's
    // dep pre-bundler rewrites it into something bootsharp can't boot. Leave it
    // alone and let the browser fetch it as-is.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...new Set([...(config.optimizeDeps?.exclude ?? []), 'motely-wasm'])],
    };
    return config;
  },
};

export default config;
