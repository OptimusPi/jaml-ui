import type { Preview } from '@storybook/react-vite'
import React from 'react'
import '../src/ui/jimbo.css'
import './preview.css'
import { JimboBackground } from '../src/ui/jimboBackground'
import { JimboApp } from '../src/ui/jimboApp'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: { disable: true },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
    // The hard-locked 320×568 JimboApp is THE container. Centered in the canvas
    // with no flex via the position:fixed + inset:0 + margin:auto trick (see
    // .sb-stage); the .j-app (540) and footer (28) stack by normal block flow.
    //
    // Opt-out: a story that renders its OWN JimboApp (e.g. SeedFinderApp — a
    // full app, not a primitive) sets `parameters.jimboHarness: false`. Wrapping
    // it again nests two 320×540 shells (busted size, escaping buttons), so we
    // render it bare in the stage and let it bring its own shell.
    (Story, context) => {
      const ownsShell = context.parameters?.jimboHarness === false;
      return (
        <>
          <JimboBackground />
          <div className="sb-stage">
            {ownsShell ? (
              <Story />
            ) : (
              <JimboApp>
                <Story />
              </JimboApp>
            )}
          </div>
        </>
      );
    },
  ],
};

export default preview;
