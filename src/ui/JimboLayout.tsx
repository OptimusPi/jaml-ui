"use client";

import type { HTMLAttributes } from "react";

// The .j-stack / .j-row classes these bind to already exist in jimbo.css and are
// grid-based by design — see the "Layout primitives" section there. This file is
// only the missing React half.

/** Spacing scale — maps to the --j-space-* tokens. */
export type JimboGap = "xs" | "sm" | "md" | "lg" | "xl";

/** Cross-axis placement. */
export type JimboAlign = "start" | "center" | "end" | "stretch";

/** Main-axis distribution. */
export type JimboJustify = "start" | "center" | "end" | "between";

export type JimboLayoutProps = HTMLAttributes<HTMLDivElement> & {
  /** Space between children. Default "md" (8px). */
  gap?: JimboGap;
  align?: JimboAlign;
  justify?: JimboJustify;
};

// Class names are spelled out rather than interpolated. An interpolated name
// never appears as a literal in the source, so nothing can grep for it and no
// dead-CSS pass can count it — which is exactly how the orphaned `.j-row--md`
// scale sat in jimbo.css unnoticed. `satisfies` makes a missing variant a type
// error instead of a silently unstyled element.
const LAYOUT_CLASS = {
  "j-stack": {
    gap: {
      xs: "j-stack--gap-xs", sm: "j-stack--gap-sm", md: "j-stack--gap-md",
      lg: "j-stack--gap-lg", xl: "j-stack--gap-xl",
    },
    align: {
      start: "j-stack--align-start", center: "j-stack--align-center",
      end: "j-stack--align-end", stretch: "j-stack--align-stretch",
    },
    justify: {
      start: "j-stack--justify-start", center: "j-stack--justify-center",
      end: "j-stack--justify-end", between: "j-stack--justify-between",
    },
  },
  "j-row": {
    gap: {
      xs: "j-row--gap-xs", sm: "j-row--gap-sm", md: "j-row--gap-md",
      lg: "j-row--gap-lg", xl: "j-row--gap-xl",
    },
    align: {
      start: "j-row--align-start", center: "j-row--align-center",
      end: "j-row--align-end", stretch: "j-row--align-stretch",
    },
    justify: {
      start: "j-row--justify-start", center: "j-row--justify-center",
      end: "j-row--justify-end", between: "j-row--justify-between",
    },
  },
} as const satisfies Record<
  "j-stack" | "j-row",
  { gap: Record<JimboGap, string>; align: Record<JimboAlign, string>; justify: Record<JimboJustify, string> }
>;

function layoutClasses(
  base: "j-stack" | "j-row",
  { gap = "md", align, justify }: JimboLayoutProps,
  className?: string,
  extra?: string,
) {
  const map = LAYOUT_CLASS[base];
  return [
    base,
    map.gap[gap],
    align && map.align[align],
    justify && map.justify[justify],
    extra,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Vertical stack — the answer for "these go under each other". */
export function JimboStack({
  gap,
  align,
  justify,
  className,
  children,
  ...rest
}: JimboLayoutProps) {
  return (
    <div className={layoutClasses("j-stack", { gap, align, justify }, className)} {...rest}>
      {children}
    </div>
  );
}

export type JimboRowProps = JimboLayoutProps & {
  /** Soft-wrap onto more rows when the row runs out of width. */
  wrap?: boolean;
};

/**
 * Horizontal row — the answer for "these go next to each other". Columns size to
 * their content (`grid-auto-columns: max-content`), so this is what every
 * hand-rolled layout div in the consumer screens should collapse into.
 * Defaults to vertically centred.
 */
export function JimboRow({
  gap,
  align = "center",
  justify,
  wrap,
  className,
  children,
  ...rest
}: JimboRowProps) {
  return (
    <div
      className={layoutClasses(
        "j-row",
        { gap, align, justify },
        className,
        wrap ? "j-row--wrap" : undefined,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
