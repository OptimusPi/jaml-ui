import type { Decorator, Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { useEffect } from 'react';
import bootsharp from 'motely-wasm';
import { JimboBackground } from '../src/components/JimboBackground.tsx';
import { JimboBackground as JimboBackgroundLegacy } from '../src/ui/JimboBackground.js';
import '../src/styles/jaml.css';
import '../src/ui/jimbo.css';
import './preview.css';

// Legacy apps (Apps/*) bring their own JimboApp shell and fill the viewport.
// Everything else is a primitive and gets the v10 app context.
const isLegacyApp = (title?: string) => !!title?.startsWith('Apps/');

const withApp: Decorator = (Story, context) => {
  const motion = context.globals.motion as string | undefined;
  useEffect(() => {
    const root = document.documentElement;
    if (motion === 'reduced') root.dataset.motion = 'reduced';
    else delete root.dataset.motion;
  }, [motion]);

  if (isLegacyApp(context.title)) {
    return (
      <>
        <JimboBackgroundLegacy />
        <Story />
      </>
    );
  }

  return (
    <>
      <JimboBackground />
      <div className="j-app">
        <Story />
      </div>
    </>
  );
};

const preview: Preview = {
  loaders: [
    async () => {
      if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
      return {};
    },
  ],
  decorators: [
    withApp,
    withThemeByDataAttribute({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
    }),
  ],
  globalTypes: {
    motion: {
      description: 'Motion',
      toolbar: {
        title: 'Motion',
        icon: 'transfer',
        items: [
          { value: 'full', title: 'Full motion' },
          { value: 'reduced', title: 'Reduced motion' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { motion: 'full' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: { test: 'error' },
    backgrounds: { disable: true },
  },
  tags: ['autodocs'],
};

export default preview;
