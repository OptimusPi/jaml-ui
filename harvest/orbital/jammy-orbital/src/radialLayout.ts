// Orbit geometry — excavated from JAMMY (`components/jimbo-ui/RadialNavigation/RadialMenu.tsx`).
//
// Lifted out of the component on the way out: this is pure math with no React,
// no DOM, no imports. That makes it unit-testable and reusable by any renderer
// (SVG, canvas, React Native) rather than only the Tailwind/DOM one.
//
// This is the file that carries the "magnetic snap" feel. There is no physics
// and no spring solver — the feel comes from three decisions:
//
//   1. Slots are placed at *exactly even* angle steps around an ellipse. Items
//      never drift to arbitrary positions, so every open lands on a lattice.
//   2. A pill that would overlap the mascot is pushed **outward along its own
//      ray** (`k >= 1`) — never sideways, never inward. Overlap resolution
//      preserves the angle, so the lattice survives collision.
//   3. Everything animates on one shared cubic-bezier(0.16, 1, 0.3, 1) — a
//      fast-out, long-settle curve. Combined with (1), pills appear to *snap*
//      into detents.
//
// An earlier version ran an iterative overlap solver and clamped X toward 0.
// Both are gone: the solver produced "mushy, uneven layouts" and the X-clamp
// pulled pills *inward* onto the mascot, which is the opposite of the intent.

/** Degrees reserved at south (90°) for the pinned back/start button. */
export const FULL_CIRCLE_RAD = 2 * Math.PI;
export const SOUTH_ANGLE_RAD = Math.PI / 2;

/** ~half height of a radial pill (px) — used with width for clearance vs the round mascot. */
export const PILL_HALF_H = 15;

/** Gap (px) between the mascot bitmap edge and the nearest pill corner. */
export const MASCOT_CLEARANCE_GAP = 10;

/** Minimum width of the south-pinned button so it always reads as the primary action. */
export const MIN_SOUTH_WIDTH = 148;

/**
 * Inset (px) from the container edge for the bottom-pinned south button.
 *
 * Small on purpose: Balatro's exit button is full-bleed against its modal's
 * inner edge, so this is a hairline breathing gap, not a margin.
 */
export const SOUTH_EDGE_INSET = 4;

export interface OrbitSlot<T> {
    item: T;
    /** Offset from orbit center, px. */
    x: number;
    /** Offset from orbit center, px. Positive is down (screen coords). */
    y: number;
}

/**
 * Estimated pill width for clamp math.
 *
 * Tuned for the m6x11 pixel font at ~12px plus padding and the optional toggle
 * dot. It is deliberately an estimate — measuring every pill would force a
 * layout pass per frame, and the clearance math only needs to be close.
 */
export function estimatePillWidth(label: string, hasToggleDot: boolean): number {
    const charW = 7.25;
    const basePad = 36;
    const dot = hasToggleDot ? 16 : 0;
    const w = basePad + dot + label.length * charW;
    return Math.min(200, Math.max(56, w));
}

/**
 * Minimum distance from orbit center to pill center so the pill's *corner*
 * clears the round mascot bitmap. Uses the diagonal reach, not half-width, so
 * pills at 45° don't clip.
 */
export function minDistanceFromMascotCenter(mascotHalfPx: number, pillHalfW: number): number {
    const cornerReach = Math.hypot(pillHalfW, PILL_HALF_H);
    return mascotHalfPx + MASCOT_CLEARANCE_GAP + cornerReach;
}

/**
 * Place items on an ellipse at even angle steps, pushing outward-only when a
 * slot would collide with the mascot.
 *
 * @param items         Orbital items (south-pinned item must already be removed).
 * @param rx            Horizontal orbit radius, px.
 * @param ry            Vertical orbit radius, px.
 * @param startAngle    Angle of the first slot, radians.
 * @param stepRad       Angle between slots, radians.
 * @param mascotSizePx  Mascot hit-target diameter, px.
 * @param measure       Returns `[label, hasToggleDot]` for width estimation.
 */
export function layoutOrbitalEllipse<T>(
    items: T[],
    rx: number,
    ry: number,
    startAngle: number,
    stepRad: number,
    mascotSizePx: number,
    measure: (item: T) => { label: string; hasToggleDot: boolean },
): Array<OrbitSlot<T>> {
    if (items.length === 0) return [];

    const mascotHalf = Math.max(0, mascotSizePx) / 2;

    return items.map((item, i) => {
        const angle = startAngle + i * stepRad;
        const ux = Math.cos(angle) * rx;
        const uy = Math.sin(angle) * ry;
        const d0 = Math.hypot(ux, uy);

        const { label, hasToggleDot } = measure(item);
        const halfW = estimatePillWidth(label, hasToggleDot) / 2;
        const minDist = minDistanceFromMascotCenter(mascotHalf, halfW);

        // Degenerate center slot — push due east.
        if (d0 < 1e-4) {
            return { item, x: minDist, y: 0 };
        }

        // Outward-only scale along the existing ray. k >= 1 guarantees we never
        // pull a pill toward the mascot, only away from it.
        const k = Math.max(1, minDist / d0);
        return { item, x: ux * k, y: uy * k };
    });
}

/** Vertical breathing gap (px) between stacked pills and around the mascot band. */
export const ARC_STACK_GAP = 6;

/** How far (px) the page-control centers sit above the south button's center. */
export const PAGE_CONTROL_LIFT = 20;

/**
 * THE ORBIT LAW (pifreak, 2026-08-17). Read this before touching the geometry.
 *
 * The ring is NOT a circle, and treating it as one is what made it overflow on
 * a short viewport. The real shape:
 *
 *   1. Every pill has the SAME HEIGHT. Only the width varies, and it varies with
 *      content. Therefore **height is the only parameter that governs overlap** —
 *      stack the slots vertically with at least one pill-height between them and
 *      two pills can never collide, whatever their labels say.
 *   2. Then X FLIES OUT: each pill travels away from center along its own side
 *      until its outer edge hits the container wall. Nothing is ever pulled
 *      inward toward the mascot.
 *   3. The arc is bounded by the TIPS of the extra-wide "Back" button. Back spans
 *      almost the full container width along the bottom, so the arc runs from its
 *      left tip, up the left wall, across the top, and down to its right tip —
 *      roughly 300°, not 360°.
 *
 * Why this beats the ellipse-with-clamp it replaces: an ellipse sized by
 * `min(boxW, boxH)` wastes the width of a short-and-wide box and still needs a
 * mascot-clearance push that can exceed any radius bound (measured: a 103px pill
 * shoved 23px out of a 275x185 box). Height-spacing plus wall-flyout fills the
 * box exactly and cannot overflow it, because the wall IS the stop condition —
 * so the mascot never has to shrink to make the math work.
 *
 * The wall is HARD. There is deliberately no mascot-clearance push here: pills
 * render above the mascot, so wall-flush X can graze the character's silhouette
 * — measured up to ~25px for the widest toggle pill at his equator in the
 * tightest 275px-wide phone box, and ~1px for ordinary pills. That is a
 * cosmetic cost paid knowingly: the character stays full-size and visible
 * behind the pill, while the alternative — pushing past the wall to clear him —
 * clips the pill out of the container, which is a functional bug. Never shrink
 * the mascot to buy clearance; that trade was already made once and rejected.
 *
 * @param items      Orbital items (the south-pinned item must already be removed).
 * @param boxW       Container width, px.
 * @param boxH       Container height, px.
 * @param southTopY  Y of the topmost south chrome edge (Back button, or the page
 *                   controls when shown), relative to center, positive down. The
 *                   arc must not descend past it.
 * @param measure    Returns label + toggle-dot presence for width estimation.
 */
export function layoutOrbitalArc<T>(
    items: T[],
    boxW: number,
    boxH: number,
    southTopY: number,
    measure: (item: T) => { label: string; hasToggleDot: boolean },
): Array<OrbitSlot<T>> {
    if (items.length === 0) return [];

    const halfW = boxW / 2;
    const halfH = boxH / 2;

    // The band the arc may occupy: top wall down to Back's top edge.
    const yTop = -halfH + PILL_HALF_H;
    const yBottom = Math.min(halfH - PILL_HALF_H, southTopY - PILL_HALF_H - ARC_STACK_GAP);

    // Split into two columns. Order runs up the left then down the right, so the
    // sequence still reads clockwise from Back's left tip.
    const leftCount = Math.ceil(items.length / 2);
    const sides = items.map((_item, i) => (i < leftCount ? -1 : 1));

    // Slots per side, spaced by height. When a side has more pills than the band
    // can hold at full spacing we compress evenly rather than spilling: pills
    // touching is a legible crowd, pills outside the container is a bug.
    const step = 2 * PILL_HALF_H + ARC_STACK_GAP;
    const slotY = (indexOnSide: number, countOnSide: number): number => {
        if (countOnSide <= 1) return yTop;
        const span = yBottom - yTop;
        const wanted = step * (countOnSide - 1);
        const gap = wanted <= span ? step : span / (countOnSide - 1);
        // Fill from the bottom tip upward, so a short menu hugs Back rather than
        // floating at the top of an empty box.
        return yBottom - indexOnSide * gap;
    };

    const rightCount = items.length - leftCount;
    let li = 0;
    let ri = 0;

    return items.map((item, i) => {
        const side = sides[i];
        const y = side < 0 ? slotY(li++, leftCount) : slotY(ri++, rightCount);

        const { label, hasToggleDot } = measure(item);
        const w = estimatePillWidth(label, hasToggleDot);
        const pillHalfW = w / 2;

        // Fly out until the outer edge meets the wall. The wall is the hard
        // boundary — see the ORBIT LAW above for why there is no mascot nudge.
        const x = side * Math.max(0, halfW - pillHalfW - SOUTH_EDGE_INSET);

        return { item, x, y };
    });
}

/**
 * How many pills a box can hold on the arc without breaking the height law.
 *
 * Two columns, one slot per `2*PILL_HALF_H + ARC_STACK_GAP` of usable band. The
 * band conservatively reserves room for the page controls, so flipping from
 * "fits" to "paginates" can never itself shrink the band it was measured
 * against. This is the number the PAGER should respect: when a menu exceeds it,
 * show fewer items per page — never smaller pills, never a smaller mascot
 * (see clampOrbitRadius's note; the same principle).
 */
export function arcPageCapacity(boxH: number): number {
    if (!Number.isFinite(boxH) || boxH <= 0) return 2;
    const halfH = boxH / 2;
    const yTop = -halfH + PILL_HALF_H;
    const southButtonY = halfH - PILL_HALF_H - SOUTH_EDGE_INSET;
    const pageControlTopY = southButtonY - PAGE_CONTROL_LIFT - PILL_HALF_H;
    const yBottom = pageControlTopY - PILL_HALF_H - ARC_STACK_GAP;
    const span = yBottom - yTop;
    const step = 2 * PILL_HALF_H + ARC_STACK_GAP;
    const slotsPerSide = Math.max(1, Math.floor(span / step) + 1);
    return 2 * slotsPerSide;
}

/**
 * Width of the south-pinned button.
 *
 * Sized to fill the angular gap it occupies so it reads as one wide primary
 * action rather than "another pill that happens to be at the bottom", then
 * clamped to the container and floored at {@link MIN_SOUTH_WIDTH}.
 */
export function southButtonWidth(totalSlots: number, orbitRadiusX: number, containerW: number): number {
    const fill =
        totalSlots <= 1
            ? Math.round(2 * orbitRadiusX * 1.05)
            : Math.round(2 * orbitRadiusX * Math.sin(FULL_CIRCLE_RAD / totalSlots / 2) * 1.28);

    return Math.max(MIN_SOUTH_WIDTH, Math.min(fill, containerW - 16));
}

/**
 * Orbit radius for a given mascot size and item count.
 *
 * Grows 3px per orbital item so a crowded ring breathes outward instead of
 * cramming, and is floored so pills always clear the mascot.
 */
export function orbitRadiusForCount(mascotSizePx: number, orbitalCount: number, baseRadius: number): number {
    const minOrbitR = mascotSizePx / 2 + 42;
    return Math.max(84, baseRadius + orbitalCount * 3, minOrbitR);
}

/** Distance below orbit center at which the south-pinned pill is drawn. */
export const SOUTH_PILL_OFFSET = 8;

/**
 * Largest orbit radius that still fits inside a box of `boxW` x `boxH`.
 *
 * The ring is centered in its box, so only half of each dimension is available,
 * and the outermost thing on the ring is not the pill *center* — it is the south
 * pill's bottom edge, which sits `SOUTH_PILL_OFFSET + PILL_HALF_H` past the
 * radius. Subtract both and the ring is guaranteed to stay inside.
 *
 * Why this exists: `orbitRadiusForCount` grows the radius with item count and
 * `baseRadius` is derived from viewport WIDTH alone (see
 * useRadialViewportGeometry) -- height is never consulted. On a short viewport
 * that combination puts the south pill below the bottom edge with no upper
 * bound. Clamping to the box makes overflow structurally impossible instead of
 * something each host has to notice and hand-tune.
 */
export function maxOrbitRadiusForBox(boxW: number, boxH: number): number {
    const halfSpan = Math.min(boxW, boxH) / 2;
    return Math.max(0, halfSpan - PILL_HALF_H - SOUTH_PILL_OFFSET);
}

/**
 * Clamp a desired radius to its box.
 *
 * The floor keeps the ring clear of the mascot: squeezing the radius below the
 * mascot's own half-size would drop pills on top of the character, which reads
 * as broken rather than as tight. Below that point the box is simply too small
 * for a ring, and the caller should show fewer items rather than a smaller
 * circle -- pagination (ORBITAL_PAGE_SIZE) already exists for exactly that.
 */
export function clampOrbitRadius(radius: number, mascotSizePx: number, maxRadius?: number): number {
    if (maxRadius == null || !Number.isFinite(maxRadius) || maxRadius <= 0) return radius;
    const floor = mascotSizePx / 2 + MASCOT_CLEARANCE_GAP;
    return Math.max(floor, Math.min(radius, maxRadius));
}
