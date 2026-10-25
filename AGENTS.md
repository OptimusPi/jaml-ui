# jaml-ui (v9 line)

Balatro-style React primitives (`Jimbo*` components), shared by every JAML
site. Change components here, not in apps. The v10 rewrite on `master`
rebuilds these on Base UI — this branch keeps the 9.x line working.

## Button spec (Balatro — this is the whole point, do not improvise)

A button is a chunky rounded face in a tone color (`--j-btn-face`), white
pixel-font label, and a hard 4px drop shadow. Feedback copies the game
exactly:

- **Hover darkens the face** — `filter: brightness(0.88)`. Never brighten; a
  lighter hover reads as a highlight, not a Balatro button.
- **Press sinks and darkens further** — the face translates down 4px, the
  shadow collapses to none, and the face goes `brightness(0.75)`. Both
  `:active` and `[data-pressed="true"]`.
- **Disabled shows nothing** — no hover, no press feedback.

Implementation lives in `src/ui/jimbo.css` (`.j-btn`, `.j-btn__face`). Tones:
orange, red, blue, green, purple — pick per meaning, don't default
everything to orange. Sizes: xs, sm, md, lg.

`JimboSeedCopyChip` is NOT a button: it is a full-width tap-to-copy ROW
(44px tall, one seed per line). For a compact inline seed action use
`JimboButton size="xs"` and copy in the click handler.

## Commands

- `pnpm build`: tsdown (ESM + .d.ts into `dist/`).
- `pnpm typecheck`.
