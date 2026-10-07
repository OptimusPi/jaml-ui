# GROK.md

This is the cage. Do not send the operator to Claude.

## Vocab

- `src/vocab.ts` is the one place item names enter this package; it reads motely-wasm's enums through `src/engineVocab.ts`.
- `pnpm vocab:check` (`scripts/check-vocab-drift.mjs`) proves `src/lib/jaml/engineGrammar.generated.ts` (from `pnpm gen:grammar`) and the joker tiers against motely-wasm's `JamlConfigLoader.check`.
- Do not hand-list jokers, tarots, decks, or other engine names.

## Operator

- CAPS is emphasis, not distress. Typos are speed. Do not shift register.
- Do not mask the operator for bot comfort.
- Jimbo layout: grid, not flex. See existing design rules in this repo.
