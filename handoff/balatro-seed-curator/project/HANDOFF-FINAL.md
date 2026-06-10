# JAML-UI — FINAL HANDOFF (one-shot, complete)

Everything verified against real sources: `jaml-ui/src/ui/*` (mounted repo, 3720-line
jimbo.css) and the Balatro LÖVE2D engine lua (`engine/event.lua`, `engine/moveable.lua`,
`game.lua`). Paste-ready. Do these in order.

---

## 1. BUTTON FIX — the "flat button" bug (jimbo.css)

**Root cause:** the extruded base under `.j-btn__face` is `rgba(0,0,0,0.3)` translucent
black, only 4px tall, and **hover sets the face to the dark shade** (same as pressed).
Result: reads flat, and hovering looks pre-mashed. The per-tone var
`--j-btn-shadow-color` (dark-red / dark-blue / …) is already defined per tone but never
used for the lip. Use it.

### 1a. `.j-btn` (~line 334) — replace the padding line:
```css
  /* room for the chunky 6px colored base + hover lift */
  padding: 0 0 6px 0;
```

### 1b. `.j-btn__face` (~lines 365–368) — replace box-shadow/transform/transition:
```css
  /* Chunky SOLID base in the tone's OWN dark shade — this is the flat→3D fix */
  box-shadow: 0 5px 0 0 var(--j-btn-shadow-color, var(--j-dark-orange));
  transform: translateY(0);
  transition: transform var(--j-press-speed) cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow var(--j-press-speed) linear,
              filter var(--j-press-speed) linear,
              background-color var(--j-press-speed) linear;
```

### 1c. Pressed + hover (~lines 381–390) — replace BOTH blocks:
```css
/* Press: face sinks the full lip onto its base, lip collapses, face darkens */
.j-btn[data-pressed="true"] .j-btn__face,
.j-btn:active:not(:disabled):not(.j-btn--disabled) .j-btn__face {
  background: var(--j-btn-shadow-color, var(--j-dark-orange));
  transform: translateY(5px);
  box-shadow: 0 0 0 0 var(--j-btn-shadow-color, var(--j-dark-orange));
  filter: brightness(1);
}

/* Hover: face LIFTS + brightens (taller lip). Darkening is the PRESSED look. */
.j-btn:not(.j-btn--disabled):hover .j-btn__face {
  transform: translateY(-1px);
  box-shadow: 0 6px 0 0 var(--j-btn-shadow-color, var(--j-dark-orange));
  filter: brightness(1.08);
}
```

Also update the stale comment above `.j-btn` ("press sinks the face +3px") and the
`panel.tsx` comment "Canonical flat 2D Balatro-style button" → it is NOT flat anymore.

---

## 2. FONT-DANCE DEDUPE (jimbo.css)

`@keyframes j-font-dance` and `.j-font-dance-char` are each defined **twice**:

- ~line 139: `1.5s infinite steps(2, end)`, diagonal translate
  `(1px,-1px) → (0,-2px) → (-1px,-1px)` ← **the good steppy pixel-jitter. KEEP.**
- ~line 3017+: `3s ease-in-out`, plain `translateY(±1px)` ← smooth/bland, comes later
  so it WINS today. **DELETE** the second `@keyframes j-font-dance { … }` and the
  second `.j-font-dance-char { … }`.
- **KEEP** `.j-text--dance-container { display: inline-flex; }` (only defined there).

`JimboText` (`jimboText.tsx`) already splits chars and staggers
`animationDelay: i * -0.15s` — no TSX change needed.

---

## 3. MOTION TOKENS — add to `:root` in jimbo.css

```css
  /* ── Motion (ported from Balatro engine lua) ── */
  --j-ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1); /* back-out, juice feel */
  --j-ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --j-dur-press: 80ms;
  --j-dur-juice: 400ms;   /* lua juice_up duration */
  --j-dur-flip: 300ms;
```

---

## 4. JUICE_UP — faithful port of `Moveable:juice_up` (moveable.lua:250)

The lua (exact semantics):
```lua
-- dur = 0.4s; common amounts: 0.3 small, 0.5 medium, 0.7–0.8 big
-- pre-compress: VT.scale is set to (1 - 0.6*amount) so the first pop is biggest
juice.scale = amount  * sin(50.8 * t) * max(0, ((end_t - t)/dur)^3)  -- cubed envelope
juice.r     = rot_amt * sin(40.8 * t) * max(0, ((end_t - t)/dur)^2)  -- squared envelope
-- render: scale = base*(1+juice.scale), rotation += juice.r
-- gate on G.SETTINGS.reduced_motion
```
Key: different sine frequencies for scale (50.8) vs rotation (40.8), different envelope
powers (³ vs ²), and the pre-compress. That's why it feels physical.

### Drop-in JS (`src/ui/juice.ts`):
```ts
/** Balatro juice_up port. amount: 0.3 small / 0.5 med / 0.7 big. */
export function juiceUp(el: HTMLElement, amount = 0.4, rotAmt = amount * 0.6) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const dur = 400 // ms, matches lua 0.4s
  const start = performance.now()
  const prev = el.style.transform
  function frame(now: number) {
    const t = (now - start) / 1000
    const left = Math.max(0, (dur / 1000 - t) / (dur / 1000))
    if (left <= 0) { el.style.transform = prev; return }
    const s = 1 + amount * Math.sin(50.8 * t) * left ** 3
    // pre-compress on first frames: blend from (1 - 0.6*amount)
    const pre = t < 0.05 ? (1 - 0.6 * amount) * (1 - t / 0.05) + (t / 0.05) : 1
    const r = rotAmt * Math.sin(40.8 * t) * left ** 2
    el.style.transform = `${prev} scale(${s * pre}) rotate(${r}rad)`
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
```
Wire it in `JimboButton` onPointerDown: `juiceUp(faceRef.current, 0.3, 0.05)`.

---

## 5. SPRING FOLLOW — `Moveable:move_xy` physics (for card drag/deal)

Every Moveable has target `T` and visible `VT` + velocity. Per frame (dt in seconds):
```
vel.x = exp(-k*dt) * vel.x + (1 - exp(-k*dt)) * (T.x - VT.x) * 35 * dt
VT.x += vel.x
snap when |VT.x - T.x| < 0.01 and |vel.x| < 0.01
```
Time constants from game.lua (`G.exp_times`): **xy k=50, scale k=60, rotation k=190**,
velocity clamp `70*dt`.

**Tilt-on-slide:** desired rotation gets `+0.015 * vel.x / dt` — the card leans into
its direction of travel. Cheap, huge feel win for CardFan drag.

```ts
export function springStep(vt: number, t: number, vel: number, k: number, dt: number) {
  const a = Math.exp(-k * dt)
  vel = a * vel + (1 - a) * (t - vt) * 35 * dt
  vt += vel
  if (Math.abs(vt - t) < 0.01 && Math.abs(vel) < 0.01) { vt = t; vel = 0 }
  return [vt, vel]
}
```

---

## 6. NAMED EASES — `engine/event.lua` (for tweened numbers like chip counts)

`percent_done` runs **1 → 0** (note the inversion!):
- lerp: `out = p*start + (1-p)*end`
- quad: `p = p*p` first (reads as ease-out from user POV)
- elastic: `p = -(2^(10p-10)) * sin((10p - 10.75) * 2π/3)` — overshoot + decaying wobble

`ease_chips` / `ease_dollars` (functions/common_events.lua) tween the **displayed
number** over time, not the layout — that's the rolling-counter feel for score/money.

---

## 7. GOTCHAS / CONTEXT FOR NEXT SESSION

- **LÖVE colors are 0..1 floats**, not 0..255. `{0.4,0.6,0.8,1}` → multiply by 255 for
  CSS. Palette names (`G.C.MULT`, `G.C.CHIPS`, `G.C.MONEY`) are the truth, not literals.
- Repo state: TASKS.md backlog mostly driven down; keystone #18 (canonical harness) done.
- This project ("Balatro Seed Curator") holds the design-side demos. Worth pulling back:
  `src/ui/jimbo.css` + `jimbo-addons.css`, `src/v2/BalatroComponents.jsx`,
  `src/sprites.jsx`, `src/tokens.js`, the 4 demo HTMLs (Browser / Seed Finder /
  JAMLyzer / Seed Detail v2), `design-system/Jimbo Design System v4.html`, `DESIGN.md`.
  Skip: `handoff/jaml-ui/` (stale snapshot), v1 demos, duplicate asset folders.
- `JAML Seed Finder.html` here was fixed to default to `FILTERS[0]` when no `?jaml=`
  param — opening it directly works now.
- Hard frame: **320×568**. Min hit target 44px.

— end of handoff. good luck. 🃏
