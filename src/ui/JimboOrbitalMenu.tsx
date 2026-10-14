"use client";

// Harvested from @pifreak/jammy-orbital (`RadialMenu.tsx` + `RadialButton.tsx` +
// `RadialPill.tsx`), which was itself excavated from JAMMY. This replaces the
// 67-line badges-on-a-circle stub that shipped under this name and was never
// imported by anything but JimboMascot.
//
// Rewritten rather than pasted, on three counts:
//   - the harvest was Tailwind + clsx + tailwind-merge; jaml-ui has none of
//     those, and `display: flex` is banned in src/ (the iframe determinism
//     rule). Every row here is grid.
//   - pills were a bespoke button reimplementing the south-edge lip that
//     JimboButton already owns. They compose it now, so a tone change lands in
//     one place.
//   - the store was Zustand. See ./orbitalMenuStore for what replaced it.
//
// This file is the renderer only: it decides *what component* each item becomes
// and where the chrome sits. The orbit math lives in ./orbitalLayout, and the
// menu stack lives in ./orbitalMenuStore, so both are testable without a DOM.

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { JimboButton } from "./JimboButton.js";
import { JimboStatusPill, type JimboStatus } from "./JimboStatusPill.js";
import {
  FULL_CIRCLE_RAD,
  MIN_SOUTH_WIDTH,
  PAGE_CONTROL_LIFT,
  PILL_HALF_H,
  SOUTH_ANGLE_RAD,
  SOUTH_EDGE_INSET,
  SOUTH_PILL_OFFSET,
  layoutOrbitalArc,
  layoutOrbitalEllipse,
  southButtonWidth,
  type OrbitMeasure,
} from "./orbitalLayout.js";

export type JimboOrbitalTone = "red" | "blue" | "orange" | "green" | "purple";

/**
 * Strict color semantics, carried over from the harvest because they are how
 * the ring stays readable at a glance:
 *
 *   RED    submenu or plain action        ORANGE  toggle, and the way out
 *   BLUE   talks to the assistant         GREEN   start (welcome screen only)
 *   PURPLE a counted / tallied thing
 */
export interface JimboOrbitalMenuItem {
  label: string;
  /** Emitted through `onAction`. Omit when `submenu` is set. */
  action?: string;
  /** Pushes a submenu of this name instead of firing an action. */
  submenu?: string;
  tone?: JimboOrbitalTone;
  /** Present (even as `false`) makes this a toggle and draws the state dot. */
  active?: boolean;
  disabled?: boolean;
  /** Draws a tally on the pill's right edge. */
  count?: number;
  /** Drawn in place of a count. */
  icon?: ReactNode;
  tooltip?: string;
  /** Renders a non-interactive status pill instead of a button. */
  badge?: { label: string; status: JimboStatus };
  /**
   * Pin to the south slot. That slot is the way out — Balatro's exit law is a
   * full-width button along the very bottom at any modal size — so at most one
   * item should carry it.
   */
  south?: boolean;
  /** Render at lower opacity (unavailable, but worth showing). */
  dim?: boolean;
}

export interface JimboOrbitalMenuProps {
  items: JimboOrbitalMenuItem[];
  onAction?: (action: string, item: JimboOrbitalMenuItem) => void;
  /** Fired when a `submenu` item is clicked. */
  onNavigate?: (submenu: string) => void;
  /** Fired when the south item is clicked. */
  onBack?: () => void;
  /** Current menu name — keys the pills so a submenu push re-animates them. */
  currentMenu?: string;
  /** Collapse the pills to center (the close/push animation). */
  closing?: boolean;
  /** Mascot diameter (px). Pills are pushed out to clear it. */
  mascotSize?: number;
  /** Horizontal orbit radius (px). */
  radius?: number;
  /** Vertical orbit radius (px). Defaults to `radius`. */
  radiusY?: number;
  /**
   * Height of the box the ring is sectioned into (px).
   *
   * When given, geometry switches to THE ORBIT LAW (see ./orbitalLayout): pills
   * stack by height and fly out to the walls, and the south button pins to the
   * container's bottom edge at full width instead of riding the orbit. That is
   * what makes the ring fit a short, wide box without shrinking the mascot.
   */
  boxHeight?: number;
  /** Vertical shift (px) — hosts use it to dodge an on-screen keyboard. */
  translateY?: number;
  /** Rendered above the south button. */
  breadcrumb?: ReactNode;
  showPageControls?: boolean;
  onPagePrev?: () => void;
  onPageNext?: () => void;
  /** Drawn at the ring's center, beneath the pills — usually a JimboMascot. */
  center?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const isToggle = (item: JimboOrbitalMenuItem) => typeof item.active === "boolean";

const measure = (item: JimboOrbitalMenuItem): OrbitMeasure => ({
  label: item.label,
  hasToggleDot: isToggle(item),
});

/**
 * Orbital radial menu.
 *
 * The south item stays pinned under the mascot; everyone else sits at equal
 * angle steps with a single outward push when a pill would overlap the center.
 * See ./orbitalLayout for why there is no iterative solver — the evenness is
 * the whole effect.
 */
export function JimboOrbitalMenu({
  items,
  onAction,
  onNavigate,
  onBack,
  currentMenu = "main",
  closing = false,
  mascotSize = 96,
  radius = 90,
  radiusY,
  boxHeight,
  translateY = 0,
  breadcrumb,
  showPageControls = false,
  onPagePrev,
  onPageNext,
  center,
  className,
  "aria-label": ariaLabel = "Orbital menu",
}: JimboOrbitalMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(375);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const apply = () => setContainerW(Math.max(1, el.clientWidth));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A closed ring still has to draw its center: the mascot IS the tap target
  // that opens it, so returning null here would leave nothing to tap.
  if (items.length === 0) {
    return center ? (
      <div
        ref={rootRef}
        className={["j-orbital-menu", className].filter(Boolean).join(" ")}
        style={{ transform: `translateY(${translateY}px)` }}
      >
        <div className="j-orbital-menu__center">{center}</div>
      </div>
    ) : null;
  }

  const rx = radius;
  const ry = radiusY ?? radius;

  // The south item holds a slot in the angular budget even though it renders at
  // a fixed position — that is what keeps the ring even around it.
  const southItem = items.find((item) => item.south) ?? null;
  const orbitalItems = items.filter((item) => !item.south);
  const totalSlots = orbitalItems.length + (southItem ? 1 : 0);
  const slotStepRad = FULL_CIRCLE_RAD / totalSlots;
  const startAngle = southItem ? SOUTH_ANGLE_RAD + slotStepRad : SOUTH_ANGLE_RAD;

  const pinnedSouth = boxHeight != null && Number.isFinite(boxHeight) && boxHeight > 0;
  const southWidth = pinnedSouth
    ? Math.max(MIN_SOUTH_WIDTH, containerW - SOUTH_EDGE_INSET * 2)
    : southButtonWidth(totalSlots, rx, containerW);

  // Chrome is anchored to the south button rather than to the viewport, so it
  // stays attached to it when the orbit resizes.
  const southY = pinnedSouth ? boxHeight / 2 - PILL_HALF_H - SOUTH_EDGE_INSET : ry + SOUTH_PILL_OFFSET;
  // Capped, not just floored. The harvested formula was half the south button,
  // which was fine when south rode the orbit — but a pinned south spans the
  // whole container, and two half-width controls then tile it edge to edge and
  // read as one segmented bar. Capped, they sit at south's tips as nudges.
  const pageControlW = Math.min(96, Math.max(56, Math.floor(southWidth * 0.5)));
  const pageControlY = southY - PAGE_CONTROL_LIFT;

  // The arc must clear the topmost south chrome — page controls sit above the
  // south button when pagination is on, so they set the floor.
  const southChromeTopY =
    (showPageControls && southItem ? pageControlY : southY) - PILL_HALF_H;

  const solved =
    pinnedSouth && boxHeight != null
      ? layoutOrbitalArc(orbitalItems, containerW, boxHeight, southChromeTopY, measure)
      : layoutOrbitalEllipse(orbitalItems, rx, ry, startAngle, slotStepRad, mascotSize, measure);

  const clickItem = (item: JimboOrbitalMenuItem) => (event: MouseEvent) => {
    // The mascot underneath is itself a tap target; without this every pill
    // click would also toggle the menu shut.
    event.stopPropagation();
    if (item.south) onBack?.();
    else if (item.submenu) onNavigate?.(item.submenu);
    else if (item.action) onAction?.(item.action, item);
  };

  return (
    <div
      ref={rootRef}
      className={["j-orbital-menu", className].filter(Boolean).join(" ")}
      style={{ transform: `translateY(${translateY}px)` }}
    >
      {center ? <div className="j-orbital-menu__center">{center}</div> : null}

      {/* Zero-size anchor: every pill positions against this exact center point. */}
      <div className="j-orbital-menu__anchor" role="menu" aria-label={ariaLabel}>
        {breadcrumb ? (
          <OrbitalPill x={0} y={southY - 46} hiding={closing} interactive={false}>
            {breadcrumb}
          </OrbitalPill>
        ) : null}

        {solved.map(({ item, x, y }, i) => (
          <OrbitalPill
            // `currentMenu` in the key forces a fresh element per menu, so pills
            // animate out from center on a push rather than sliding over from
            // the previous menu's slots.
            key={`${currentMenu}-${item.label}-${i}`}
            x={x}
            y={y}
            hiding={closing}
            dim={item.dim}
          >
            <OrbitalItem item={item} onClick={clickItem(item)} />
          </OrbitalPill>
        ))}

        {southItem ? (
          <OrbitalPill x={0} y={southY} hiding={closing}>
            <JimboButton
              tone={southItem.tone ?? "orange"}
              size="sm"
              fullWidth
              className="j-orbital-btn j-orbital-btn--south"
              style={{ width: southWidth }}
              title={southItem.tooltip ?? southItem.label}
              onClick={clickItem(southItem)}
              role="menuitem"
            >
              {southItem.label}
            </JimboButton>
          </OrbitalPill>
        ) : null}

        {southItem && showPageControls ? (
          <>
            <OrbitalPill x={-(southWidth / 2) + pageControlW / 2} y={pageControlY} hiding={closing}>
              <PageControl label="<" title="Previous page" width={pageControlW} onClick={onPagePrev} />
            </OrbitalPill>
            <OrbitalPill x={southWidth / 2 - pageControlW / 2} y={pageControlY} hiding={closing}>
              <PageControl label=">" title="Next page" width={pageControlW} onClick={onPageNext} />
            </OrbitalPill>
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Absolutely-positioned wrapper for one orbital item.
 *
 * Position rides on two custom properties read by one shared stylesheet rule.
 * The excavated version injected a `<style>` tag per pill, which thrashed the
 * CSSOM on every menu change.
 */
function OrbitalPill({
  x,
  y,
  hiding,
  dim,
  interactive = true,
  children,
}: {
  x: number;
  y: number;
  hiding: boolean;
  dim?: boolean;
  interactive?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="j-orbital-pill"
      data-hiding={hiding ? "true" : "false"}
      data-dim={dim ? "true" : undefined}
      data-static={interactive ? undefined : "true"}
      style={
        {
          "--j-orbit-x": `${hiding ? 0 : x}px`,
          "--j-orbit-y": `${hiding ? 0 : y}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** Order matters: a badge is checked first so it can never become a button. */
function OrbitalItem({
  item,
  onClick,
}: {
  item: JimboOrbitalMenuItem;
  onClick: (event: MouseEvent) => void;
}) {
  if (item.badge) {
    return <JimboStatusPill status={item.badge.status} label={item.badge.label} title={item.tooltip} />;
  }

  const toggle = isToggle(item);

  return (
    <JimboButton
      tone={item.tone ?? (toggle ? "orange" : "red")}
      size="sm"
      className="j-orbital-btn"
      disabled={item.disabled}
      title={item.tooltip ?? item.label}
      aria-label={toggle ? `${item.label} (${item.active ? "on" : "off"})` : item.label}
      aria-pressed={toggle ? item.active : undefined}
      role="menuitem"
      onClick={onClick}
    >
      {toggle ? <span className="j-orbital-dot" data-on={item.active ? "true" : "false"} aria-hidden /> : null}
      <span>{item.label}</span>
      {item.icon ? (
        <span className="j-orbital-glyph" aria-hidden>
          {item.icon}
        </span>
      ) : typeof item.count === "number" ? (
        <span className="j-orbital-count" data-any={item.count > 0 ? "true" : "false"}>
          {item.count}
        </span>
      ) : null}
    </JimboButton>
  );
}

function PageControl({
  label,
  title,
  width,
  onClick,
}: {
  label: string;
  title: string;
  width: number;
  onClick?: () => void;
}) {
  return (
    <JimboButton
      tone="blue"
      size="sm"
      className="j-orbital-btn"
      style={{ width }}
      title={title}
      aria-label={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {label}
    </JimboButton>
  );
}
