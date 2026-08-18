# Jimbo (jaml-ui) — conventions

Balatro-styled design system for seedfinder.app. Everything below was learned
by rendering all 44 components; follow it and compositions come out looking
like the game instead of a website.

## The stage is dark, always
Compose on the Balatro stage: a dark `#0c1818` surface (wrap screens in
`JimboBox` with that background, or `JimboBackground` for the animated WebGL
swirl). Most text tones are light — on a white page half the system is
invisible. `JimboBackground` paints a fixed, full-viewport canvas at negative
z-index: when composing it inside any transformed/overflow container, give the
wrapper `isolation: isolate` or the swirl vanishes behind opaque siblings.

## Type
Two faces, both shipped with this project: `m6x11` (the pixel font — all UI
chrome, buttons, labels; sizes are tuned for it, don't substitute) via
`var(--j-font)`, and JetBrains Mono for code/JAML surfaces via
`var(--j-font-code)`. Sentence case everywhere.

## Buttons and the Back law
`<button class="j-btn j-btn--<tone>"><span class="j-btn__face">Label</span></button>`.
Tones: `--red` (primary/open), `--blue` (secondary), `--orange` (toggles and
EXITS), `--gold` (selection). `j-btn--full` makes it span its container.
Balatro's modal law: the way out of any modal/overlay is ALWAYS a full-width
ORANGE button labeled "Back", pinned at the container's very bottom. Never an
X icon, never grey text.

## Color comes from tokens
Use `var(--j-gold)`, `var(--j-orange)`, `var(--j-darkest)`,
`var(--j-inner-border)`, … from the shipped stylesheet — never hardcoded hex.
Chip/tone semantics follow the game (red opens, orange toggles, green starts,
purple carries counts).

## Game art renders itself
`JamlGameCard`, `JimboSprite`, `DeckSprite`, and the Jamlyzer components draw
real Balatro sprite sheets onto canvas from item NAMES — pass the engine's
PascalCase identifiers ("GreedyJoker", "CharmTag", "TheSerpent") and the right
art appears; there is nothing to import per-item. Pixel art stays crisp via
image-rendering: pixelated — don't scale sprites with CSS transforms.

## Layout primitives
Prefer `JimboPanel` / `JimboInnerPanel` / `JimboInset` nesting over ad-hoc
divs; density is a feature (this UI serves expert seed hunters — dense,
information-rich, playful-sharp). The mascot (`JimboMascot` / `JammyMascot`)
is a character with agency, not an icon: give him room, never shrink him to
make layout math easier.
