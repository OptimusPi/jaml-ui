"use client";

// Excavated from JAMMY (`components/jimbo-ui/RadialNavigation/RadialBreadcrumb.tsx`), verbatim.

import { twMerge } from "tailwind-merge";

export interface RadialBreadcrumbProps {
    label: string;
    title?: string;
    className?: string;
}

/** Dark, so it reads as chrome rather than as another orbital action. */
const BREADCRUMB_STYLE = {
    backgroundColor: "#1a1e2e",
    border: "1.5px solid rgba(255,255,255,0.18)",
    color: "#f6f0d5",
    opacity: 0.92,
} as const;

/**
 * "Currently viewing" indicator.
 *
 * Sits directly above the Back button — the two together answer "where am I"
 * and "how do I leave" in one glance, which a radial menu badly needs since it
 * has no persistent header.
 */
export function RadialBreadcrumb({ label, title, className }: RadialBreadcrumbProps) {
    return (
        <div
            role="status"
            aria-label={title ?? `In: ${label}`}
            title={title ?? `In: ${label}`}
            className={twMerge(
                "pointer-events-auto flex items-center gap-1 rounded-[11px] px-[10px] py-[2px] font-serif text-[11.5px] font-normal shadow-[0_4px_0_0_rgba(30,30,30,0.9)] select-none sm:px-[14px]",
                className,
            )}
            style={BREADCRUMB_STYLE}
        >
            <span className="text-[9.5px] opacity-50">›</span>
            <span className="whitespace-nowrap">{label}</span>
        </div>
    );
}
