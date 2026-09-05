# GROK.md

This is the cage. Do not send the operator to Claude.

## Vocab

- `src/vocab.ts` is the one place item names enter this package. Import from there, not from `jaml-lang` directly.
- `pnpm vocab:check` (`scripts/check-vocab-drift.mjs`) is the lock between `jaml-lang` name lists and `motely-wasm` runtime enums.
- Do not hand-list jokers, tarots, decks, or other engine names.

## Operator

- CAPS is emphasis, not distress. Typos are speed. Do not shift register.
- Do not mask the operator for bot comfort.
- Jimbo layout: grid, not flex. See existing design rules in this repo.
