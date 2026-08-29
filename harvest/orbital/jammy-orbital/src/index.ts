// Jammy Orbital — excavated UX from the JAMMY seedfinder.
// See ../README.md for provenance and porting notes.

import "./styles.css";

// ── Mascot ────────────────────────────────────────────────────────────────────
export { Mascot } from "./Mascot";
export type { MascotProps, MascotHandle } from "./Mascot";

// ── Orbital menu ──────────────────────────────────────────────────────────────
export { RadialMenu } from "./RadialMenu";
export type { RadialMenuProps } from "./RadialMenu";

export { RadialPill } from "./RadialPill";
export type { RadialPillProps } from "./RadialPill";

export { RadialButton, BUTTON_THEMES } from "./RadialButton";
export type {
    RadialButtonProps,
    RadialButtonColor,
    RadialButtonActionProps,
    RadialButtonToggleProps,
    RadialButtonCountProps,
    RadialButtonBackProps,
    ButtonTheme,
} from "./RadialButton";

export { RadialBadge } from "./RadialBadge";
export type { RadialBadgeProps, RadialBadgeState } from "./RadialBadge";

export { RadialBreadcrumb } from "./RadialBreadcrumb";
export type { RadialBreadcrumbProps } from "./RadialBreadcrumb";

// ── State ─────────────────────────────────────────────────────────────────────
export { useRadialMenu } from "./useRadialMenu";
export type { UseRadialMenuProps, RadialMenuState } from "./useRadialMenu";

export { useRadialMenuStore, resetRadialMenuState, clearRadialMenuTimers } from "./radialMenuStore";
export type { RadialMenuStore, RadialMenuNav } from "./radialMenuStore";

export { useRadialViewportGeometry } from "./useRadialViewportGeometry";
export type { RadialViewportSnapshot } from "./useRadialViewportGeometry";

// ── Geometry (pure, no React — safe to unit test) ─────────────────────────────
export {
    layoutOrbitalEllipse,
    estimatePillWidth,
    minDistanceFromMascotCenter,
    southButtonWidth,
    orbitRadiusForCount,
    maxOrbitRadiusForBox,
    clampOrbitRadius,
    SOUTH_PILL_OFFSET,
    FULL_CIRCLE_RAD,
    SOUTH_ANGLE_RAD,
    PILL_HALF_H,
    MASCOT_CLEARANCE_GAP,
    MIN_SOUTH_WIDTH,
} from "./radialLayout";
export type { OrbitSlot } from "./radialLayout";

// ── Seed card ─────────────────────────────────────────────────────────────────
export { SeedCarousel } from "./SeedCarousel";
export type { SeedCarouselProps, SeedEntry } from "./SeedCarousel";

// ── Design tokens & item model ────────────────────────────────────────────────
export { JimboColorOption, JIMBO_ANIMATIONS, withAlpha } from "./palette";
export type { JimboPaletteColor } from "./palette";

export { MenuColors } from "./types";
export type {
    MenuItem,
    SubmenuItem,
    ChatItem,
    ToggleItem,
    ActionItem,
    StartItem,
    CountItem,
    IndicatorLightBadge,
} from "./types";
