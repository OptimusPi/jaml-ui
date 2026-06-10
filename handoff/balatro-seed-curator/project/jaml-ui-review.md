# jaml-ui review — findings &amp; suggested fixes

Pass over `jaml-ui/src/ui/*` against the v2 design-system reference. Each
finding has a copy-paste patch. Nothing here is load-bearing — the library
ships fine — but each one is a small smell worth cleaning while you're in
there.

---

## 1 · Dead `background` declaration in tab hover · `src/ui/jimbo.css` (~line 625)

```css
.j-tab__btn[data-active="false"]:hover {
  background: var(--j-red);
  background: var(--j-dark-red);   /* first line is overwritten — dead code */
}
```

The first `background: var(--j-red)` is immediately overwritten by the
second on the next line. Drop it.

**Patch**
```css
.j-tab__btn[data-active="false"]:hover {
  background: var(--j-dark-red);
}
```

---

## 2 · Duplicate `@font-face m6x11` alias · `src/ui/jimbo.css` (lines 13-22)

```css
@font-face {
  font-family: 'm6x11plus';
  src: url('/fonts/m6x11plus.otf') format('opentype');
  ...
}
@font-face {
  font-family: 'm6x11';            /* alias face — same file */
  src: url('/fonts/m6x11plus.otf') format('opentype');
  ...
}
```

Two `@font-face` blocks pointing at the same OTF. The `m6x11` alias is
only referenced in `--j-font` as a fallback inside the m6x11plus family
string — which never fires, because m6x11plus always resolves first.

Either:
- **Drop the alias.** Remove the second `@font-face` block and change the
  fallback chain to `var(--j-font): 'm6x11plus', monospace`.
- **Or ship the real m6x11 file** as a smaller-rendering fallback for
  ultra-small UI text.

The current state — alias to the same file — is purely a maintenance
landmine: if you ever swap m6x11plus.otf out, you'll forget to swap both
references.

---

## 3 · `JimboInfoCard` always emits a dead inline `style` · `src/ui/jimboInfoCard.tsx` (line 19)

```tsx
<div
  className={`j-info-card ${borderClass} ${className}`}
  style={tone ? { borderColor: undefined } : undefined}
  {...props}
>
```

`{ borderColor: undefined }` does nothing — `undefined` is dropped before
the style attribute is serialised. The ternary is also pointless because
both branches are equivalent. And because `style` is set **before**
`{...props}`, a caller's `style={{ borderColor: ... }}` actually wins
regardless. Net effect: this entire prop is dead.

**Patch**
```tsx
<div
  className={`j-info-card ${borderClass} ${className}`}
  {...props}
>
```

If the original intent was "let the consumer's `style` win over the
border-class tone," that already happens via the `.j-border--*` classes
using `!important` (which is what they should do anyway — see #4).

---

## 4 · `.j-border--*` should be `!important` or use `border-color` with explicit specificity · `src/ui/jimbo.css` (lines 1330-1352)

```css
.j-border--red    { border-color: var(--j-red); }
```

`.j-info-card` ships with `border: 3px solid transparent;`. The shorthand
`border:` declaration in `.j-info-card` resets `border-color` to
transparent at the same specificity as `.j-border--red`, so source order
decides. Right now `.j-info-card` is defined **before** `.j-border--*`
(line 1555 vs 1330) — wait, no, `.j-border--*` is at 1330 and `.j-info-card`
is at 1555. So `.j-info-card`'s `border-color: transparent` (inside the
shorthand) actually wins by source order, and tone borders silently no-op.

Either reorder `.j-border--*` **after** `.j-info-card`, or make them
`!important`. The latter is the cheapest fix:

**Patch**
```css
.j-border--red    { border-color: var(--j-red)    !important; }
.j-border--blue   { border-color: var(--j-blue)   !important; }
.j-border--green  { border-color: var(--j-green)  !important; }
.j-border--gold   { border-color: var(--j-gold)   !important; }
.j-border--orange { border-color: var(--j-orange) !important; }
.j-border--purple { border-color: var(--j-purple) !important; }
```

Worth checking visually before/after — if the tone borders **are** showing
today, this finding is wrong and the source order I read is misleading me.
Quick smoke test: render `<JimboInfoCard tone="red">` and confirm the
3px red border is visible.

---

## 5 · `JimboBackButton` uses utility classes that may not exist · `src/ui/panel.tsx` (line 89)

```tsx
<div className="j-back-btn-wrap j-flex j-justify-center j-w-full">
```

`j-flex`, `j-justify-center`, `j-w-full` are bootstrap-flavored utilities.
Grep shows you do use `j-flex` and `j-justify-between` elsewhere in
`showcase.tsx`. Confirm these are all defined in `jimbo.css` (I didn't
see them in the slice I read). If they aren't, this wrap is silently
laying out via inherited block flow rather than the centered flex you
intended. Either define them or replace with inline style:

```tsx
<div className="j-back-btn-wrap" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
  <JimboButton tone="orange" size="sm" fullWidth onClick={onClick} className="j-back-btn">Back</JimboButton>
</div>
```

Lower priority — `fullWidth` on the button is what's actually doing the
work; the flex on the wrap is belt-and-braces.

---

## 6 · `JimboVerticalTabs` double-rotates label · `src/ui/jimbo.css` (line ~700) and `src/ui/jimboTabs.tsx`

```css
.j-vtab {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}
```

`writing-mode: vertical-rl` already rotates the text to read top-down on
the right edge. Adding `transform: rotate(180deg)` flips it to bottom-up
on the left edge. That may be intentional (matches the "CONSUMABLES"
vertical rail in your reference screenshots), but the comment says
"writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);"
with no explanation. Add a comment or remove the rotate. I'd lean
remove — bottom-up text is harder to read than top-down for most users.

---

## 7 · `JimboTabs` triangle indicator uses raw inline SVG instead of token · `src/ui/jimboTabs.tsx`

The bouncing triangle is a fundamental design-system primitive (it's the
*only* cue for the active tab — there's no underline, no background
swap). Right now its color comes from CSS (`.j-tab__indicator svg { fill:
var(--j-red); }`) but its **shape** is inlined as `<polygon points="7,10
0,0 14,0" />` inside the component. If you ever want to reuse that
triangle elsewhere (a "this is what's selected" pointer in the workbench,
for example), you'll copy the polygon string.

Suggested: extract to a tiny named component in the same file.

```tsx
function JimboPointer({ active }: { active: boolean }) {
  return (
    <div className="j-tab__indicator" data-active={active} aria-hidden>
      <svg width={14} height={10} viewBox="0 0 14 10">
        <polygon points="7,10 0,0 14,0" />
      </svg>
    </div>
  )
}
```

Then `JimboTabs` uses `<JimboPointer active={isActive} />` and other
components can import it directly. Not blocking, just a tidy-up.

---

## 8 · `JimboPanel` `sway` prop applies to wrong element on nested panels

`useSway` attaches a transform to the panel's outer element. When a
consumer puts a sway-enabled `JimboPanel` inside another sway-enabled
panel (rare but possible — e.g. a modal inside a screen), the transforms
compound and the inner panel oscillates relative to a moving parent.
Result: motion sickness.

Two options:
- **Block at the type level.** Pass a `swayDepth` through React context,
  and have `useSway` early-return if depth > 0.
- **Document it.** Add a sentence to the JSDoc on `JimboPanel`:
  > `sway` is intended for the topmost panel of a screen. Don't enable
  > sway on a JimboPanel nested inside another sway-enabled JimboPanel.

The doc fix is fine for now.

---

## 9 · CSS file is 2735 lines — consider splitting

`jimbo.css` is large enough that finding things requires repeated grep
passes. The natural splits map directly onto the v2 design-system page:

```
src/ui/jimbo/
  tokens.css            (lines 1-100 — :root, fonts, base text)
  panels.css            (panel, inner-panel, inset)
  buttons.css           (j-btn + tones + sizes + back button)
  tabs.css              (j-tabs, j-vtabs, indicator, keyframes)
  badges.css            (j-badge)
  info-card.css         (j-info-card + tone borders)
  section-header.css    (j-section-header + j-bg-- utilities)
  stat-grid.css         (j-stat-grid)
  app-shell.css         (j-app + container queries)
  utilities.css         (j-flex, j-text-center, etc.)
  animations.css        (keyframes — sheen, bounce, bob, dance)
```

Then `jimbo.css` becomes a 12-line file of `@import`s. Vite's
`cssCodeSplit: false` still emits one bundle.

Not urgent. Worth doing right before the next big component lands.

---

## 10 · Add the missing primitives I assumed existed

While writing v1 of the design system I reflexively drew controls the
reference screenshots imply but the library doesn't have yet. Worth
adding (in roughly priority order):

| Primitive          | Where it'd live                       | Why                                         |
|--------------------|---------------------------------------|---------------------------------------------|
| `JimboStepper`     | new file `jimboStepper.tsx`           | `‹ value ›` pattern is everywhere in opts   |
| `JimboSlider`      | new file `jimboSlider.tsx`            | screenshake / CRT-style sliders             |
| `JimboCheckbox`    | new file `jimboCheckbox.tsx`          | the chunky red ✓ box                        |
| `JimboScoreboard`  | new file `jimboScoreboard.tsx`        | chips × mult composite                      |
| `JimboBlindColumn` | new file `jimboBlindColumn.tsx`       | the 3-up "choose your blind" layout         |
| `JimboSegmented`   | new file `jimboSegmented.tsx`         | in-panel mode switch (filters / seeds /…)   |

The screenshots all use these and your seed-curator product will, too.
Each is small (one button-shape composite). I'd suggest adding them as
they come up in real screens rather than spec'ing them ahead of time.

---

## Summary

| #  | Severity | Effort | File                              |
|----|----------|--------|-----------------------------------|
| 1  | low      | trivial| `jimbo.css` — dead `background:`  |
| 2  | low      | trivial| `jimbo.css` — m6x11 alias         |
| 3  | low      | trivial| `jimboInfoCard.tsx` — dead style  |
| 4  | **med**  | trivial| `jimbo.css` — tone-border specificity |
| 5  | low      | small  | `panel.tsx` — utility class deps  |
| 6  | low      | trivial| `jimbo.css` — vtab double rotate  |
| 7  | low      | small  | `jimboTabs.tsx` — extract pointer |
| 8  | low      | small  | `panel.tsx` — sway depth          |
| 9  | low      | medium | `jimbo.css` — split file          |
| 10 | feature  | each TBD| six new primitives               |

The only one I'd flag as worth fixing **today** is **#4** (tone borders
might be silently no-op on `JimboInfoCard`). Everything else is
opportunistic.
