# DESIGN.md — JAML / Jamlyzer rules

These are NON-NEGOTIABLE. If a design violates one of these, fix it before
showing the user. Don't argue.

## Audience & device

- **iPhone SE (375×667) is the target.** Design for it first.
- **No scrolling on the home / search / results screens.** It's a challenge to
  fit it in the small space — that's the whole point. It looks great on mobile.
- **Inside the Jamlyzer**, vertical scroll is allowed (the analyzer is a long
  list of items by nature). Everywhere else: fit it.
- The user is on a phone, holding it one-handed, slapping the screen with their
  thumb. Design like that's true.

## Bottom-back rule

- The "back" button **always lives at the absolute bottom of the screen**.
- It's a **full-width thumb-target**, not jammed in a corner.
- This is a UX rule for a reason — humans hold phones with one hand and slap
  the bottom with their thumb. Don't put the most-used escape control in the
  top-right where they can't reach.

## Typography

- The pixel font is **m6x11plus**.
- **NEVER use bold with m6x11plus.** It already reads loud; bold makes it ugly.
- **NEVER ALL-CAPS.** Lowercase everything (the JAML/Balatro voice). "copied!"
  not "COPIED!". "back" not "BACK". The font even renders nicer in lowercase.

## Colors

- Use the JimboColor tokens from `jimbo-ui`. Do not invent new colors.
- Gold is the JAML highlight. Red is for JAML "should". Blue is for JAML
  "must". Don't reassign these.

## Stride bars (the red `‹` `›` columns)

- Strides are **full-height of the section they bookend**. They don't float
  partially over content — they ARE the bookends.
- They overflow the content vertically a little — that's the JimboUI signature.

## Jamlyzer (seed detail)

- Jamlyzer = the analyzer. **One** view. No "preview" tab. No "jaml map" tab.
- Shows **every item** (jokers, packs, vouchers, tags, bosses, soul jokers)
  for every ante in the seed.
- Items the JAML filter hit get a **gold underglow** + colored keyline (blue
  for must, red for should). Non-hits are flat.
- The seed pager (‹ N/M ›) sits at the top.
- The full-width `back` button sits at the very bottom.
- **Magnetic snap to ante boundaries.** The analyzer scrolls vertically and
  snaps to each ante section (CSS `scroll-snap-type: y mandatory`,
  `scroll-snap-align: start` on each ante). Each ante is at least one viewport
  tall so snap feels deliberate.
- **Ante 0 exists** when ante 1 has a Hieroglyph voucher (Hieroglyph: -1 ante,
  +1 hand → the search backsteps and reveals an ante 0). When that's the case,
  prepend an ante 0 section before ante 1.

## Shop stream

- The shop is **one continuous endless stream** across all antes — grab and
  drag horizontally. Slot indices visible. Ante boundaries are inline markers,
  not separate sections.

## Result rows

- The seed code on the left of every results row **copies on tap**. Confirm
  with a brief gold flash + "copied!" (lowercase).

## Don't add filler

- No rarity rollup card-back grid. No "preview" page. No tabs that go to one
  thing. If a section doesn't earn its space, kill it.
- The user will yell at you (correctly) if you add scope.

## Voice / tone

- Lowercase, punchy, slightly tongue-in-cheek. "no negatives" not "No Negatives Found."
- Don't say "PRO TIP" or "Click here to". Just show the thing.
