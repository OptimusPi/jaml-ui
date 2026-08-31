// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  // `harvest/**` is a quarry, not product: verbatim copies from the dead
  // seedfinder / weejoker / JAMMY trees, kept only until each one is ported onto
  // Jimbo primitives and deleted (see harvest/MANIFEST.md). Linting foreign code
  // that is scheduled for deletion is wasted work.
  { ignores: ['dist/**', 'storybook-static/**', 'node_modules/**', 'assets/**', '**/*.d.ts', 'examples/**', 'harvest/**', '.claude/', '.claude/**', '.storybook/**', 'scripts/**', '.design-sync/**', '.ds-sync/**', 'ds-bundle/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  storybook.configs["flat/recommended"]
);
