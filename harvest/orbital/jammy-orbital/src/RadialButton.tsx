"use client";

// Excavated from JAMMY (`components/jimbo-ui/RadialNavigation/RadialButton.tsx`).
// Only change: palette import repointed at the local `./palette`.

import React, { useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { JimboColorOption } from "./palette";
import "./styles.css";

// ── Color themes ──────────────────────────────────────────────────────────────

export type RadialButtonColor =
    | "orange"
    | "purple"
    | "red"
    | "green"
    | "blue"
    | "seed-zero"
    | "seed-low"
    | "seed-top";

interface ButtonTheme {
    bg: string;
    shadow: string;
    text: string;
}

const BUTTON_THEMES: Record<RadialButtonColor, ButtonTheme> = {
    orange: { bg: JimboColorOption.ORANGE, shadow: JimboColorOption.DARK_ORANGE, text: JimboColorOption.WHITE },
    purple: { bg: JimboColorOption.PURPLE, shadow: JimboColorOption.DARK_PURPLE, text: JimboColorOption.WHITE },
    red: { bg: JimboColorOption.RED, shadow: JimboColorOption.DARK_RED, text: JimboColorOption.WHITE },
    green: { bg: JimboColorOption.GREEN, shadow: JimboColorOption.DARK_GREEN, text: JimboColorOption.WHITE },
    blue: { bg: JimboColorOption.BLUE, shadow: JimboColorOption.DARK_BLUE, text: JimboColorOption.WHITE },
    // Result-ranking tiers — kept from JAMMY's seed list. Rename freely; the
    // orbit itself doesn't care, these are just three extra dark themes.
    "seed-zero": { bg: JimboColorOption.BLACK, shadow: "#111111", text: JimboColorOption.WHITE },
    "seed-low": { bg: JimboColorOption.DARK_GREY, shadow: JimboColorOption.DARKEST, text: JimboColorOption.WHITE },
    "seed-top": { bg: JimboColorOption.DARKEST, shadow: JimboColorOption.BLACK, text: JimboColorOption.GOLD },
};

// ── Shared base classes ───────────────────────────────────────────────────────

/** Hard 4px bottom edge, no blur — the Balatro "chunky plastic" read. */
const BUTTON_SHADOW = "0 4px 0 0 rgba(0,0,0,0.8)";

const BASE_CLASSES = clsx(
    "group flex items-center justify-center gap-1.5 rounded-[10px] border-none px-[10px] py-[3px] outline-none select-none",
    "font-normal",
    "transition-[transform,box-shadow] duration-[80ms] ease-out",
);

const INTERACTIVE_CLASSES = "cursor-pointer";
const DISABLED_CLASSES = "cursor-not-allowed opacity-67";
const WIDE_CLASSES = "w-[130px] sm:w-[160px]";
const NORMAL_WIDTH = "min-w-[54px] sm:min-w-[64px]";

// ── Variants ──────────────────────────────────────────────────────────────────

export interface RadialButtonActionProps {
    variant?: "action";
    label: string;
    color?: RadialButtonColor;
    tooltip?: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    style?: React.CSSProperties;
}

export interface RadialButtonToggleProps {
    variant: "toggle";
    label: string;
    active: boolean;
    color?: RadialButtonColor;
    tooltip?: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

export interface RadialButtonCountProps {
    variant: "count";
    label: string;
    count: number;
    icon?: string;
    color?: RadialButtonColor;
    tooltip?: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    style?: React.CSSProperties;
}

export interface RadialButtonBackProps {
    variant: "back" | "start";
    label: string;
    color?: RadialButtonColor;
    tooltip?: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    style?: React.CSSProperties;
}

export type RadialButtonProps =
    | RadialButtonActionProps
    | RadialButtonToggleProps
    | RadialButtonCountProps
    | RadialButtonBackProps;

/**
 * Polymorphic radial navigation button.
 *
 * Replaces four separate components (Button, CountIndicator, Toggle, Back/Start)
 * with one `variant` prop. All variants share the pill: 3D bottom-edge shadow
 * that vanishes on press while the button translates down by exactly the shadow
 * height — the button appears to physically depress rather than just tint.
 *
 * Press state is tracked with pointer events + `setPointerCapture` so a drag off
 * the button still releases the press, which `:active` alone does not do
 * reliably on touch.
 */
export function RadialButton(props: RadialButtonProps) {
    const { label, tooltip, onClick, className } = props;
    const variant = props.variant ?? "action";
    const [isPressed, setIsPressed] = useState(false);

    // South pills (Start / Back) share one orange. An earlier green-Start /
    // red-Back split made the primary action read as two different controls.
    const isSouthPill = variant === "start" || variant === "back";
    let colorKey: RadialButtonColor;
    if (isSouthPill) {
        colorKey = (props as RadialButtonBackProps).color ?? "orange";
    } else if (variant === "toggle") {
        colorKey = (props as RadialButtonToggleProps).color ?? "red";
    } else if (variant === "count") {
        colorKey = (props as RadialButtonCountProps).color ?? "red";
    } else {
        colorKey = (props as RadialButtonActionProps).color ?? "red";
    }

    const theme = BUTTON_THEMES[colorKey];
    const altText = computeAltText(props, variant);
    const isDisabled = variant === "toggle" && (props as RadialButtonToggleProps).disabled === true;
    const isWide = variant === "back" || variant === "start";

    return (
        <button
            type="button"
            onClick={isDisabled ? undefined : onClick}
            onPointerDown={
                isDisabled
                    ? undefined
                    : (e) => {
                          setIsPressed(true);
                          e.currentTarget.setPointerCapture(e.pointerId);
                      }
            }
            onPointerUp={isDisabled ? undefined : () => setIsPressed(false)}
            onPointerCancel={isDisabled ? undefined : () => setIsPressed(false)}
            onPointerLeave={isDisabled ? undefined : () => setIsPressed(false)}
            aria-label={altText}
            title={tooltip ?? altText}
            disabled={isDisabled}
            className={twMerge(
                clsx(
                    BASE_CLASSES,
                    isWide ? WIDE_CLASSES : NORMAL_WIDTH,
                    isDisabled ? DISABLED_CLASSES : INTERACTIVE_CLASSES,
                    className,
                ),
            )}
            style={{
                backgroundColor: theme.bg,
                boxShadow: isPressed && !isDisabled ? "none" : BUTTON_SHADOW,
                transform: isPressed && !isDisabled ? "translateY(4px)" : "translateY(0)",
                ...(props.style ?? {}),
            }}
        >
            {variant === "toggle" && (
                <ToggleDot active={(props as RadialButtonToggleProps).active} disabled={isDisabled} />
            )}

            <span className="jimbo-radial-label jimbo-radial-label--action">{label}</span>

            {variant === "count" && (
                <CountBadge
                    count={(props as RadialButtonCountProps).count}
                    icon={(props as RadialButtonCountProps).icon}
                />
            )}
        </button>
    );
}

// ── Internal sub-components ───────────────────────────────────────────────────

function ToggleDot({ active, disabled: _disabled }: { active: boolean; disabled: boolean }) {
    const dotStyle = active
        ? { backgroundColor: JimboColorOption.GREEN_TEXT, borderColor: JimboColorOption.BORDER_SILVER }
        : { backgroundColor: JimboColorOption.DARK_RED, borderColor: JimboColorOption.DARK_GREY };

    return (
        <div
            className={twMerge("h-[9px] w-[9px] shrink-0 rounded-full border")}
            style={{ borderWidth: 1, ...dotStyle }}
        />
    );
}

function CountBadge({ count, icon }: { count: number; icon?: string }) {
    if (icon) {
        return (
            <span
                className="inline-flex items-center justify-center text-[10px] leading-none"
                style={{ marginLeft: 2 }}
                aria-hidden="true"
            >
                {icon}
            </span>
        );
    }
    return (
        <span
            className="inline-flex items-center justify-center rounded-full font-mono leading-none"
            style={{
                fontSize: "10px",
                backgroundColor: JimboColorOption.DARKEST,
                color: count > 0 ? JimboColorOption.GOLD : JimboColorOption.GREY,
                minWidth: 16,
                height: 16,
                padding: "2px 4px",
                marginLeft: 2,
            }}
        >
            {count}
        </span>
    );
}

function computeAltText(props: RadialButtonProps, variant: string): string {
    if (props.tooltip) return props.tooltip;
    switch (variant) {
        case "toggle":
            return `toggle: ${props.label} (${(props as RadialButtonToggleProps).active ? "on" : "off"})`;
        case "count":
            return `${props.label}: ${(props as RadialButtonCountProps).icon ?? (props as RadialButtonCountProps).count}`;
        default:
            return `button: ${props.label}`;
    }
}

export { BUTTON_THEMES };
export type { ButtonTheme };
