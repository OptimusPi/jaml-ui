"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { JimboOrbitalMenu, type JimboOrbitalMenuItem } from "./JimboOrbitalMenu.js";
import { JimboText } from "./jimboText.js";
import {
  createJimboOrbitalStore,
  useJimboOrbitalMenu,
  type JimboOrbitalStore,
} from "./orbitalMenuStore.js";
import { arcPageCapacity, clampOrbitRadius, orbitRadiusForCount } from "./orbitalLayout.js";
import { JAMMY_SEED_MASCOT_URL } from "./jammySeedMascotImage.js";

function onActivateKey(handler: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

/**
 * Items per orbital page.
 *
 * 14 is the original JAMMY value and it is load-bearing: the longest real menu
 * is exactly 14 items, so at 14 it renders as one page with no pagination
 * chrome. An agent once "simplified" this to 7 with a confident comment about
 * crowding, silently splitting that menu across two pages. Don't.
 *
 * This is the design CEILING, not a fixed size — {@link pageSizeForBox} lowers
 * it only when the box physically cannot hold 14 same-height pills, so a phone
 * paginates while every box that fits the menu shows it whole.
 */
const ORBITAL_PAGE_SIZE = 14;

/**
 * Effective items per page: 14 is the design ceiling, the box is the physical
 * one. Where the box is smaller, the pager absorbs the difference — pills and
 * mascot never shrink to compensate (see THE ORBIT LAW in orbitalLayout).
 */
function pageSizeForBox(orbitBoxHeight: number | undefined): number {
  if (orbitBoxHeight == null || !Number.isFinite(orbitBoxHeight) || orbitBoxHeight <= 0) {
    return ORBITAL_PAGE_SIZE;
  }
  return Math.max(2, Math.min(ORBITAL_PAGE_SIZE, arcPageCapacity(orbitBoxHeight)));
}

export interface JimboMascotProps extends HTMLAttributes<HTMLDivElement> {
  mood?: "idle" | "happy" | "surprised";
  /** Box size in px. Default 96. */
  size?: number;
  /** A flat ring, no submenus. Ignored when `getMenuItems` is given. */
  menuItems?: JimboOrbitalMenuItem[];
  /**
   * Resolve the items for a menu path — `[]`, `["main"]`, `["main","Tools"]`.
   *
   * This is the seam that makes submenus, paging and the south exit the
   * mascot's job rather than every consumer's. An item with a `submenu` pushes
   * onto the path; one with an `action` fires `onMenuAction`.
   */
  getMenuItems?: (menuStack: string[]) => JimboOrbitalMenuItem[];
  onMenuAction?: (action: string, item: JimboOrbitalMenuItem) => void;
  /**
   * Largest orbit radius the ring may use, px. Pass
   * `maxOrbitRadiusForBox(w, h)` for the box the mascot is sectioned into and
   * the ring can never overflow it, however many items a menu holds.
   */
  maxOrbitRadius?: number;
  /**
   * Height of the box the mascot is sectioned into, px. Pins the south button
   * to the box's bottom edge at full width — Balatro's exit law — instead of
   * letting it ride the orbit radius.
   */
  orbitBoxHeight?: number;
  /**
   * Width of that same box, px.
   *
   * Load-bearing whenever `orbitBoxHeight` is set: the ring measures the
   * element it is drawn into, and left to itself that element is the mascot's
   * own box — a couple of hundred pixels narrower than the territory the ring
   * owns. Pills then have nowhere to fly out to and stack on the character.
   * Give the ring the real square and it fills it.
   *
   * The ring is centered on the mascot, so place the mascot where the ring's
   * center belongs — usually the middle of that square.
   */
  orbitBoxWidth?: number;
  /** Orbit radius before item-count growth. Default 90. */
  baseOrbitRadius?: number;
  /** Keep the ring shut (an overlay owns the screen). */
  menuHidden?: boolean;
  /** South-button label at the root of the menu. Deeper in it always says Back. */
  closeLabel?: string;
  /** Use a private menu store instead of the shared one. */
  orbitalStore?: JimboOrbitalStore;
  /** Draw something else as the character — the artwork seam. */
  renderImage?: (info: { size: number }) => ReactNode;
}

/** Jammy, the seed mascot — bounces, shakes, and hosts the orbital menu. */
export function JimboMascot({
  mood = "idle",
  size = 96,
  menuItems,
  getMenuItems,
  onMenuAction,
  maxOrbitRadius,
  orbitBoxHeight,
  orbitBoxWidth,
  baseOrbitRadius = 90,
  menuHidden = false,
  closeLabel = "Close",
  orbitalStore,
  renderImage,
  className = "",
  ...rest
}: JimboMascotProps) {
  // A private store by default: two mascots on one page must not drive each
  // other. A host that needs to reach in (auto-close on incoming results, say)
  // passes its own.
  const [fallbackStore] = useState(createJimboOrbitalStore);
  const menu = useJimboOrbitalMenu({ store: orbitalStore ?? fallbackStore });

  const resolve = useMemo(
    () => getMenuItems ?? (menuItems ? () => menuItems : null),
    [getMenuItems, menuItems],
  );
  const interactive = resolve != null && !menuHidden;

  const handleTap = () => {
    if (interactive) menu.toggle();
  };

  const animation =
    mood === "happy" ? "jammy-happy" : mood === "surprised" ? "jammy-shake" : "jammy-idle";

  // Everything below only matters while the ring is up, but it must be computed
  // unconditionally — hooks above, plain math here.
  const open = interactive && (menu.isOpen || menu.isClosing);
  const all = open && resolve ? resolve(menu.stack) : [];

  const pageSize = pageSizeForBox(orbitBoxHeight);
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const page = Math.min(Math.max(0, menu.page), totalPages - 1);
  const paged = all.slice(page * pageSize, (page + 1) * pageSize);

  // The way out is always present and always last: "Back" once there is a path
  // to pop, otherwise the close label.
  const south: JimboOrbitalMenuItem = {
    label: menu.canGoBack ? "Back" : closeLabel,
    south: true,
  };
  const items = open ? [...paged, south] : [];

  const orbitRadius = clampOrbitRadius(
    orbitRadiusForCount(size, paged.length, baseOrbitRadius),
    size,
    maxOrbitRadius,
  );

  const character = (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={handleTap}
      onKeyDown={interactive ? onActivateKey(handleTap) : undefined}
      aria-label="Jammy mascot"
      aria-expanded={interactive ? menu.isOpen : undefined}
      className={interactive ? "j-mascot__hit j-mascot__hit--interactive" : "j-mascot__hit"}
    >
      {renderImage ? (
        renderImage({ size })
      ) : (
        <img src={JAMMY_SEED_MASCOT_URL} alt="Jammy" draggable={false} className="j-mascot__img" />
      )}
    </div>
  );

  return (
    <div
      className={["j-mascot", animation, className].filter(Boolean).join(" ")}
      style={{ "--j-mascot-size": `${size}px` } as CSSProperties}
      {...rest}
    >
      {character}
      {open ? (
        <div
          className="j-mascot__orbit"
          style={
            {
              "--j-orbit-w": orbitBoxWidth != null ? `${orbitBoxWidth}px` : undefined,
              "--j-orbit-h": orbitBoxHeight != null ? `${orbitBoxHeight}px` : undefined,
            } as CSSProperties
          }
        >
          <JimboOrbitalMenu
            items={items}
            currentMenu={menu.currentMenu}
            closing={menu.isClosing}
            mascotSize={size}
            radius={orbitRadius}
            boxHeight={orbitBoxHeight}
            showPageControls={all.length > pageSize}
            onPagePrev={() => menu.prevPage(totalPages)}
            onPageNext={() => menu.nextPage(totalPages)}
            breadcrumb={
              menu.breadcrumb.length > 0 ? (
                <JimboText size="xs" tone="grey">
                  {menu.breadcrumb.join(" / ")}
                </JimboText>
              ) : null
            }
            onNavigate={menu.navigateTo}
            onBack={menu.back}
            onAction={(action, item) => {
              onMenuAction?.(action, item);
              menu.close();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
