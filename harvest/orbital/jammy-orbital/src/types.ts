// Orbital menu item model — excavated from JAMMY (`components/jammy/menuConfig.ts`).
//
// The original file was 760 lines: the type layer (below) plus JAMMY's entire
// menu tree (Find Seeds / Tools / Preferences / Bot Voice / shader presets…)
// and the scene-priority resolver that picked a root menu. Only the type layer
// is portable — the tree was pure app content. Build your own tree and hand it
// to `<Mascot getMenuItems={...} />`.

// ── Strict color semantics ────────────────────────────────────────────────────
// RED    = Default button, opens submenu/panel/tool/modal
// BLUE   = CHAT — sends a message to the assistant specifically
// ORANGE = TOGGLE on/off state, also used for UPLOAD
// GREEN  = START (welcome screen only)
export const MenuColors = {
    SUBMENU: "red" as const,
    CHAT: "blue" as const,
    TOGGLE: "orange" as const,
    ACTION: "red" as const,
    START: "green" as const,
    UPLOAD: "orange" as const,
};

/** Status light on a display-only pill. */
export type IndicatorLightBadge = {
    label: string;
    state: "loading" | "success" | "error";
};

// ── Discriminated union — the compiler enforces the color semantics above ─────

export interface SubmenuItem {
    label: string;
    /** RED ONLY. */
    color: typeof MenuColors.SUBMENU;
    badge?: IndicatorLightBadge;
    tooltip?: string;
    active?: never;
    /** Submenus have no action — clicking one pushes `label` onto the menu stack. */
    action?: never;
    /** Runtime styling hint — render the pill at lower opacity. */
    _dim?: boolean;
}

export interface ChatItem {
    label: string;
    action: string;
    /** BLUE ONLY. */
    color: typeof MenuColors.CHAT;
    badge?: never;
    tooltip?: string;
    active?: never;
    _dim?: boolean;
    /** Structured payload — passed through `onAction` so handlers don't parse action strings. */
    data?: Record<string, unknown>;
}

export interface ToggleItem {
    label: string;
    action: string;
    /** ORANGE ONLY. */
    color: typeof MenuColors.TOGGLE;
    active?: boolean;
    tooltip?: string;
    badge?: never;
    _dim?: boolean;
    /** Runtime hint: pin this item at the south (bottom) of the orbit. */
    _south?: boolean;
    disabled?: boolean;
}

export interface ActionItem {
    label: string;
    action: string;
    /** RED ONLY. */
    color: typeof MenuColors.ACTION;
    badge?: never;
    tooltip?: string;
    active?: never;
    _dim?: boolean;
    data?: Record<string, unknown>;
}

export interface StartItem {
    label: string;
    action: string;
    /** GREEN ONLY. */
    color: typeof MenuColors.START;
    badge?: never;
    tooltip?: string;
    active?: never;
    _dim?: never;
    _south?: boolean;
}

/** A pill with a numeric count or an emoji/icon glyph on its right edge. */
export interface CountItem {
    label: string;
    action: string;
    color: "red" | "blue" | "orange" | "green" | "purple";
    count?: number;
    icon?: string;
    tooltip?: string;
    badge?: never;
    active?: never;
    _dim?: boolean;
    data?: Record<string, unknown>;
}

export type MenuItem =
    | SubmenuItem
    | ChatItem
    | ToggleItem
    | ActionItem
    | StartItem
    | CountItem;
