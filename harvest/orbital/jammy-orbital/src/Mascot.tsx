"use client";

// Excavated from JAMMY (`components/jammy/SeedMascot.tsx`).
//
// This is the file that needed the most surgery. The original was 512 lines and
// about half of it was JAMMY's action dispatcher: audio consent, edge-TTS voice
// selection, TTS rate, chat-model preferences, shader-backdrop presets, a global
// event hub, and three Zustand app stores. None of that is mascot behavior — it
// was "what JAMMY does when you press a button", which is your app's business.
//
// Everything app-specific is gone. What survives is the character:
//   - tap-to-open / tap-to-close, with announcement dismissal taking priority
//   - orbit sizing that grows with item count
//   - pagination at 14 items, with the page controls flanking the south button
//   - chat-item centering (see `centerChatItems`)
//   - the welcome entrance: slide up first, *then* open the ring
//   - idle / talking / boing / dance motion states
//
// You supply `getMenuItems(stack)` and `onAction(action, data)`. The mascot
// stays agnostic about what any action means.

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { MenuItem } from "./types";
import { MenuColors } from "./types";
import { RadialMenu } from "./RadialMenu";
import { RadialBreadcrumb } from "./RadialBreadcrumb";
import { useRadialMenu } from "./useRadialMenu";
import { resetRadialMenuState } from "./radialMenuStore";
import { arcPageCapacity, clampOrbitRadius, orbitRadiusForCount } from "./radialLayout";
import "./styles.css";

/**
 * Items per orbital page.
 *
 * 14 is the ORIGINAL JAMMY value and it is load-bearing: the Voice menu is
 * exactly 14 items, so at 14 it renders as one page with no pagination chrome.
 * (History: an agent once "simplified" this to 7 with a confident comment about
 * crowding, silently splitting Voice into two pages — the canonical careFAKER.)
 *
 * This is the design CEILING, not a fixed size: `pageSizeForBox` lowers it only
 * when the sectioned box physically cannot hold 14 same-height pills, so a
 * phone paginates while every box that fits Voice shows it as one page.
 */
const ORBITAL_PAGE_SIZE = 14;

/**
 * Move chat-colored items to the middle of the ring.
 *
 * The orbit reads clockwise from south. Conversational actions clustered at the
 * top — furthest from the thumb-height back button — separate "talk to it" from
 * "operate it" without needing a divider or a second menu level.
 */
function centerChatItems(items: MenuItem[]): MenuItem[] {
    const chatItems = items.filter((item) => item.color === MenuColors.CHAT);
    if (chatItems.length === 0 || chatItems.length === items.length) {
        return items;
    }

    const nonChatItems = items.filter((item) => item.color !== MenuColors.CHAT);
    const leadingCount = Math.floor(nonChatItems.length / 2);

    return [...nonChatItems.slice(0, leadingCount), ...chatItems, ...nonChatItems.slice(leadingCount)];
}

function getCurrentMenuKey(menuStack: string[], isWelcome: boolean): string {
    const stackTop = menuStack.at(-1);
    if (stackTop) return stackTop;
    return isWelcome ? "welcome" : "main";
}

/**
 * The south button is "Start" only at the welcome root; everywhere else "Back".
 * One pinned position, two meanings — the user learns one spot.
 */
function getBackMenuItem(isWelcome: boolean, menuStack: string[]): MenuItem {
    const isWelcomeMenu = isWelcome && menuStack.length === 1 && menuStack[0] === "welcome";
    return isWelcomeMenu
        ? { label: "Start", action: "app-start", color: MenuColors.START, _south: true }
        : { label: "Back", action: "back-action", color: MenuColors.TOGGLE, _south: true };
}

function getMascotMotionClass({
    boing,
    dance,
    talking,
}: {
    boing: boolean;
    dance: boolean;
    talking: boolean;
}): string {
    // One-shots win over loops — a boing must not be overridden mid-bounce.
    if (boing) return "jammy-jimbo-boing-once";
    if (dance) return "jammy-jimbo-dance-once";
    return talking ? "jammy-jimbo-talking" : "jammy-jimbo-idle";
}

function paginate(
    menuItems: MenuItem[],
    page: number,
    pageSize: number,
): { items: MenuItem[]; shouldPaginate: boolean; totalPages: number } {
    const totalPages = Math.max(1, Math.ceil(menuItems.length / pageSize));
    const clampedPage = Math.min(Math.max(0, page), totalPages - 1);
    const paged = menuItems.slice(clampedPage * pageSize, (clampedPage + 1) * pageSize);
    return {
        items: centerChatItems(paged),
        shouldPaginate: menuItems.length > pageSize,
        totalPages,
    };
}

/**
 * Effective items-per-page: 14 is the design ceiling, the box is the physical
 * one. `arcPageCapacity` says how many same-height pills the box's arc can
 * hold without stacking them into each other; when the box is smaller than
 * the ceiling, the pager absorbs the difference — pills and mascot never
 * shrink to compensate (radialLayout's ORBIT LAW).
 */
function pageSizeForBox(orbitBoxHeight: number | undefined): number {
    if (orbitBoxHeight == null || !Number.isFinite(orbitBoxHeight) || orbitBoxHeight <= 0) {
        return ORBITAL_PAGE_SIZE;
    }
    return Math.max(2, Math.min(ORBITAL_PAGE_SIZE, arcPageCapacity(orbitBoxHeight)));
}

// ── Imperative handle ─────────────────────────────────────────────────────────

export interface MascotHandle {
    /** One squash-and-stretch bounce. */
    boing: () => void;
    /** Longer celebratory wiggle. */
    dance: () => void;
    open: () => void;
    close: () => void;
}

export interface MascotProps {
    /** Mascot image URL. */
    src: string;
    /** Rendered size in px. Orbit radius scales off this. */
    size?: number;
    alt?: string;
    /** Welcome screen: entrance slide + "Start" south button. */
    isWelcome?: boolean;
    /** A speech bubble is showing — the first tap dismisses it instead of opening the menu. */
    announcementActive?: boolean;
    onDismissAnnouncement?: () => void;
    /** Drives the talking animation loop. */
    isTalking?: boolean;
    /** Background results exist — keeps the ring reachable with an empty stack. */
    hasResults?: boolean;
    /** Hide the mascot and force the menu closed (e.g. a text input took over). */
    hidden?: boolean;
    /**
     * Largest orbit radius the ring may use, px — pass
     * `maxOrbitRadiusForBox(w, h)` for the box the mascot is sectioned into and
     * the ring can never overflow it, however many items the menu holds.
     * Omit and the ring sizes itself from item count alone, as before.
     */
    maxOrbitRadius?: number;
    /**
     * Height of the box the mascot is sectioned into, px. Pins the south
     * (Back/Start) pill to that box's bottom edge at full container width —
     * Balatro's exit law — instead of letting it ride the orbit radius.
     */
    orbitBoxHeight?: number;
    /** Resolve the items for a given menu path. `[]` / `["main"]` / `["main","Tools"]`… */
    getMenuItems: (menuStack: string[]) => MenuItem[];
    /** Fired for any item with an `action`. Items without one push a submenu instead. */
    onAction?: (action: string, data?: Record<string, unknown>) => void;
    /** Fired on a bare mascot tap, before the menu toggles. */
    onTap?: () => void;
    ref?: React.Ref<MascotHandle>;
    /**
     * Render the mascot image. Defaults to a plain `<img>`; pass this to use
     * `next/image` or any other loader without this package depending on it.
     */
    renderImage?: (args: { src: string; alt: string; size: number }) => React.ReactNode;
}

export const Mascot = React.memo(function Mascot({
    src,
    size = 120,
    alt = "Mascot",
    isWelcome = false,
    announcementActive = false,
    onDismissAnnouncement,
    isTalking = false,
    hasResults = false,
    hidden = false,
    maxOrbitRadius,
    orbitBoxHeight,
    getMenuItems,
    onAction,
    onTap,
    ref,
    renderImage,
}: MascotProps) {
    const [boing, setBoing] = useState(false);
    const [dance, setDance] = useState(false);

    /** Extra translateY (px) for the welcome entrance — see the effect below. */
    const [welcomeEntranceLift, setWelcomeEntranceLift] = useState(() => (isWelcome ? 92 : 0));

    const radial = useRadialMenu({
        isWelcome,
        announcementActive,
        isTalking,
        hasResults,
        onDismissAnnouncement: onDismissAnnouncement ?? (() => {}),
    });

    // Zustand outlives this component by design, so a stale menu would survive a
    // scene change. Reset on unmount.
    useEffect(() => () => resetRadialMenuState(), []);

    const triggerBoing = React.useCallback(() => {
        setBoing(true);
        globalThis.setTimeout(() => setBoing(false), 650);
    }, []);

    const triggerDance = React.useCallback(() => {
        setDance(true);
        globalThis.setTimeout(() => setDance(false), 980);
    }, []);

    useImperativeHandle(
        ref,
        () => ({ boing: triggerBoing, dance: triggerDance, open: radial.open, close: radial.close }),
        [triggerBoing, triggerDance, radial.open, radial.close],
    );

    const effectiveMenuStack = isWelcome && radial.menuStack.length === 0 ? ["welcome"] : radial.menuStack;
    const menuItems = getMenuItems(effectiveMenuStack);
    const pageSize = pageSizeForBox(orbitBoxHeight);
    const totalMenuPages = Math.max(1, Math.ceil(menuItems.length / pageSize));

    const showMenu =
        !hidden && !announcementActive && (radial.menuStack.length > 0 || hasResults) && !radial.isClosing;
    const showClosing = radial.isClosing && radial.menuStack.length > 0;
    const showBack = radial.menuStack.length >= 1;

    const currentMenu = getCurrentMenuKey(radial.menuStack, isWelcome);
    const backItem = getBackMenuItem(isWelcome, radial.menuStack);

    const paged = paginate(menuItems, radial.menuPage, pageSize);
    const displayItems: MenuItem[] =
        showMenu || showClosing ? [...(showBack ? [backItem] : []), ...paged.items] : [];

    // ── Orbit geometry ────────────────────────────────────────────────────────
    const orbitalCount = displayItems.filter(
        (it) => !("_south" in it && (it as MenuItem & { _south?: boolean })._south),
    ).length;
    const orbitRadius = clampOrbitRadius(
        orbitRadiusForCount(size, orbitalCount, radial.baseRadius),
        size,
        maxOrbitRadius,
    );
    const mascotTranslateY = radial.mascotTranslateY;

    const handleItemClick = (item: MenuItem) => {
        // No action = it's a submenu. Push its label onto the stack.
        if (!item.action) {
            radial.navigateTo(item.label);
            return;
        }

        if (item.action === "page-prev") {
            radial.prevPage(totalMenuPages);
            return;
        }
        if (item.action === "page-next") {
            radial.nextPage(totalMenuPages);
            return;
        }

        const data = "data" in item ? (item as { data?: Record<string, unknown> }).data : undefined;
        onAction?.(item.action, data);

        // Toggles keep the menu open so you can flip several in a row; anything
        // else is treated as a commit and closes the ring.
        const isToggle = "active" in item && typeof item.active === "boolean";
        if (!isToggle) {
            radial.close();
        }
    };

    const handleTap = () => {
        onTap?.();
        radial.handleTap();
    };

    /**
     * Welcome entrance, in two beats.
     *
     * Opening the ring on first paint looked like a hammer strike — everything
     * arrived at once with no anticipation. Sliding the mascot up first (70ms)
     * and only then opening the orbit (680ms) gives the motion a subject: the
     * character arrives, *then* its menu unfolds from it.
     */
    useEffect(() => {
        if (!isWelcome) return;
        const slide = globalThis.setTimeout(() => setWelcomeEntranceLift(0), 70);
        const openMenu = globalThis.setTimeout(() => radial.open(), 680);
        return () => {
            clearTimeout(slide);
            clearTimeout(openMenu);
        };
    }, [isWelcome, radial]);

    useEffect(() => {
        if (hidden) radial.close();
    }, [hidden, radial]);

    // Boing whenever the ring goes from empty to populated — the mascot reacts
    // to its own menu opening, which is what makes it feel like a character
    // rather than a button that spawns a widget.
    const prevDisplayCountRef = useRef(0);
    useEffect(() => {
        const n = displayItems.length;
        if (n > 0 && prevDisplayCountRef.current === 0) {
            triggerBoing();
        }
        prevDisplayCountRef.current = n;
    }, [displayItems.length, triggerBoing]);

    const mascotMotionClass = getMascotMotionClass({ boing, dance, talking: isTalking });

    // `jammy-orbital` scopes the stylesheet's utility layer to this subtree, so
    // the pill geometry resolves with or without Tailwind on the host.
    return (
        <div className="jammy-orbital relative flex w-full flex-col items-center justify-center">
            {displayItems.length > 0 ? (
                <RadialMenu
                    items={displayItems}
                    showClosing={showClosing}
                    mascotSizePx={size}
                    orbitRadiusX={orbitRadius}
                    orbitRadiusY={orbitRadius}
                    mascotTranslateY={mascotTranslateY}
                    boxHeight={orbitBoxHeight}
                    currentMenu={currentMenu}
                    onItemClick={handleItemClick}
                    onBack={radial.back}
                    showPageControls={paged.shouldPaginate}
                    onPagePrev={() => radial.prevPage(totalMenuPages)}
                    onPageNext={() => radial.nextPage(totalMenuPages)}
                    breadcrumb={
                        radial.breadcrumbStack.length > 0 ? (
                            <RadialBreadcrumb
                                label={radial.breadcrumbStack.at(-1) ?? ""}
                                title={`In: ${radial.breadcrumbStack.join(" › ")}`}
                            />
                        ) : undefined
                    }
                />
            ) : null}

            {!hidden && (
                <div
                    className="relative z-20 transition-transform duration-500 ease-[cubic-bezier(0.22,0.92,0.2,1.08)]"
                    style={{ transform: `translateY(${mascotTranslateY + welcomeEntranceLift}px)` }}
                >
                    <button
                        type="button"
                        onClick={handleTap}
                        className="relative block cursor-pointer rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,0.9,0.3,1.12)] will-change-transform [-webkit-backface-visibility:hidden] backface-hidden hover:scale-105 focus-visible:ring-4 focus-visible:ring-orange-500 active:scale-95"
                        style={{ width: size, height: size }}
                        aria-label={`Tap ${alt} to open the menu`}
                        aria-expanded={displayItems.length > 0}
                    >
                        {/* Motion lives on this inner span, not the button: the
                            button owns hover/active scale, and stacking both on
                            one element makes the two transforms fight. */}
                        <span
                            className={`pointer-events-none absolute inset-0 block ${mascotMotionClass}`}
                            style={{ transformOrigin: "50% 80%" }}
                        >
                            {renderImage ? (
                                renderImage({ src, alt, size })
                            ) : (
                                <img
                                    src={src}
                                    alt={alt}
                                    width={size}
                                    height={size}
                                    className="h-full w-full object-contain"
                                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
                                />
                            )}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
});
