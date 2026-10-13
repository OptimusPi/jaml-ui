import type { Decorator, Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { useEffect } from 'react';
import { JimboBackground } from '../src/components/JimboBackground.tsx';
import '../src/styles/jaml.css';

const withApp: Decorator = (Story, context) => {
  const motion = context.globals.motion as string | undefined;
  useEffect(() => {
    const root = document.documentElement;
    if (motion === 'reduced') root.dataset.motion = 'reduced';
    else delete root.dataset.motion;
  }, [motion]);
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
